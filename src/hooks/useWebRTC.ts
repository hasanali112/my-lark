"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocketContext } from "@/providers/SocketProvider";

export enum CallStatus {
  IDLE = "IDLE",
  INITIATING = "INITIATING", // Caller status
  INCOMING = "INCOMING", // Receiver status
  ACCEPTED = "ACCEPTED",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

interface CallUser {
  user_id: string;
  username: string;
  avatar: string | null;
}

export const useWebRTC = () => {
  const { socket } = useSocketContext();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<CallUser | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const isAudioOnlyRef = useRef(false);
  const callStatusRef = useRef<CallStatus>(CallStatus.IDLE);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
    setCallStatus(CallStatus.IDLE);
    callStatusRef.current = CallStatus.IDLE;
    setRoomId(null);
    setRemoteUser(null);
  }, []);

  const createPeerConnection = useCallback(
    (targetSocketId: string, currentRoomId: string) => {
      const pc = new RTCPeerConnection(configuration);

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            roomId: currentRoomId,
            targetId: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      };

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            pc.addTrack(track, localStreamRef.current!);
          });
      }

      peerConnectionRef.current = pc;
      return pc;
    },
    [socket],
  );

  // Initiate Call
  const initiateCall = useCallback(
    async (receiverId: string, video: boolean = true) => {
      if (!socket) return;
      setIsAudioOnly(!video);
      isAudioOnlyRef.current = !video;
      setCallStatus(CallStatus.INITIATING);
      callStatusRef.current = CallStatus.INITIATING;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        socket.emit("initiate-call", { receiverId, video });
      } catch (err) {
        console.error("Failed to get media devices", err);
        cleanup();
      }
    },
    [socket, cleanup],
  );

  // Handle Call Events
  useEffect(() => {
    if (!socket) return;

    socket.on(
      "call-initiated",
      (data: { roomId: string; receiver: CallUser; video: boolean }) => {
        setRoomId(data.roomId);
        setRemoteUser(data.receiver);
        setIsAudioOnly(!data.video);
      },
    );

    socket.on(
      "incoming-call",
      (data: { roomId: string; caller: CallUser; video: boolean }) => {
        setRoomId(data.roomId);
        setRemoteUser(data.caller);
        setIsAudioOnly(!data.video);
        isAudioOnlyRef.current = !data.video;
        setCallStatus(CallStatus.INCOMING);
        callStatusRef.current = CallStatus.INCOMING;
      },
    );

    socket.on(
      "call-accepted",
      async (data: {
        roomId: string;
        shouldCreateOffer: boolean;
        peerSocketId: string;
      }) => {
        setCallStatus(CallStatus.ACCEPTED);
        callStatusRef.current = CallStatus.ACCEPTED;

        // Get local stream
        if (!localStreamRef.current) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: !isAudioOnlyRef.current,
              audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
          } catch (err) {
            console.error("Failed to get local stream on accept", err);
            cleanup();
            return;
          }
        }

        // If I'm the one who should create the offer (the caller)
        if (data.shouldCreateOffer) {
          const pc = createPeerConnection(data.peerSocketId, data.roomId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("send-offer", {
            roomId: data.roomId,
            targetId: data.peerSocketId,
            offer,
          });
        }
      },
    );

    socket.on(
      "receive-offer",
      async (data: {
        offer: RTCSessionDescriptionInit;
        roomId: string;
        fromSocketId: string;
      }) => {
        const pc = createPeerConnection(data.fromSocketId, data.roomId);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("send-answer", {
          roomId: data.roomId,
          targetId: data.fromSocketId,
          answer,
        });
        setCallStatus(CallStatus.ACTIVE);
        callStatusRef.current = CallStatus.ACTIVE;
      },
    );

    socket.on(
      "receive-answer",
      async (data: {
        answer: RTCSessionDescriptionInit;
        roomId: string;
        fromSocketId: string;
      }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer),
          );
          setCallStatus(CallStatus.ACTIVE);
          callStatusRef.current = CallStatus.ACTIVE;
        }
      },
    );

    socket.on(
      "ice-candidate",
      async (data: {
        candidate: RTCIceCandidateInit;
        roomId: string;
        fromSocketId: string;
      }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate),
            );
          } catch (e) {
            console.error("Error adding ice candidate", e);
          }
        }
      },
    );

    socket.on("call-rejected", () => {
      cleanup();
    });

    socket.on("call-ended", () => {
      cleanup();
    });

    socket.on("call-missed", () => {
      cleanup();
    });

    return () => {
      socket.off("call-initiated");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("call-missed");
    };
  }, [socket, cleanup, createPeerConnection, isAudioOnly]);

  // The caller needs to know the targetSocketId to send offer.
  // The backend "call-accepted" should ideally provide targetSocketId.
  // Let's check backend app.gateway.ts lines 191-204 again.

  const acceptCall = useCallback(() => {
    if (socket && roomId) {
      socket.emit("call-response", { roomId, accept: true });
    }
  }, [socket, roomId]);

  const rejectCall = useCallback(() => {
    if (socket && roomId) {
      socket.emit("call-response", { roomId, accept: false });
      cleanup();
    }
  }, [socket, roomId, cleanup]);

  const endCall = useCallback(() => {
    if (socket && roomId) {
      socket.emit("end-call", { roomId });
      cleanup();
    }
  }, [socket, roomId, cleanup]);

  return {
    callStatus,
    localStream,
    remoteStream,
    remoteUser,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    isAudioOnly,
  };
};
