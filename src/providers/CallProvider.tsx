"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSocketContext } from "./SocketProvider";
import CallOverlay from "@/components/chat/CallOverlay";

export enum CallStatus {
  IDLE = "IDLE",
  INITIATING = "INITIATING",
  INCOMING = "INCOMING",
  ACCEPTED = "ACCEPTED",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

interface CallUser {
  user_id: string;
  username: string;
  avatar: string | null;
}

interface CallContextType {
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteUser: CallUser | null;
  initiateCall: (receiverId: string, video?: boolean) => Promise<void>;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  isAudioOnly: boolean;
  isLocalMuted: boolean;
  isLocalVideoOff: boolean;
  isRemoteMuted: boolean;
  isRemoteVideoOff: boolean;
  toggleVideo: () => void;
  toggleMute: () => void;
  callDuration: number;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocketContext();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<CallUser | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const roomIdRef = useRef<string | null>(null);
  const remoteUserRef = useRef<CallUser | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isLocalVideoOff, setIsLocalVideoOff] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Warn user before reloading/closing during an active call
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (callStatusRef.current !== CallStatus.IDLE) {
        e.preventDefault();
        e.returnValue =
          "You are on an active call. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Safely play an audio element, ignoring AbortError from rapid start/stop
  const safeAudioPlay = useCallback((audio: HTMLAudioElement) => {
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Ringtone was stopped before it could start – safe to ignore
          return;
        }
        console.warn("[CallProvider] Audio play failed:", err);
      });
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
      );
      audio.loop = true;
      ringtoneRef.current = audio;
      safeAudioPlay(audio);
    }
  }, [safeAudioPlay]);

  const playOutgoingRingtone = useCallback(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
      );
      audio.loop = true;
      ringtoneRef.current = audio;
      safeAudioPlay(audio);
    }
  }, [safeAudioPlay]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsLocalMuted(!audioTrack.enabled);
        if (socket && roomId) {
          socket.emit("call-mode-change", {
            roomId,
            type: "audio",
            enabled: audioTrack.enabled,
          });
        }
      }
    }
  }, [socket, roomId]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsLocalVideoOff(!videoTrack.enabled);
        if (socket && roomId) {
          socket.emit("call-mode-change", {
            roomId,
            type: "video",
            enabled: videoTrack.enabled,
          });
        }
      }
    }
  }, [socket, roomId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const isAudioOnlyRef = useRef(false);
  const callStatusRef = useRef<CallStatus>(CallStatus.IDLE);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      // Free TURN servers (open relay) for NAT traversal
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const cleanup = useCallback(() => {
    stopRingtone(); // Ensure ringtone stops
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }
    setCallStatus(CallStatus.IDLE);
    callStatusRef.current = CallStatus.IDLE;
    setRoomId(null);
    roomIdRef.current = null;
    setRemoteUser(null);
    remoteUserRef.current = null;
    setIsLocalMuted(false);
    setIsLocalVideoOff(false);
    setIsRemoteMuted(false);
    setIsRemoteVideoOff(false);
    setIsAudioOnly(false);
    isAudioOnlyRef.current = false;
    setCallDuration(0);
  }, [stopRingtone]);

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
        console.log(
          "[WebRTC] ontrack received:",
          event.track.kind,
          event.track.id,
        );

        const isNewStream = !remoteStreamRef.current;
        if (isNewStream) {
          // Create stream once; subsequent tracks are added to the SAME live object.
          // MediaStream is mutable – adding tracks automatically updates any
          // connected <video> element without needing to replace srcObject.
          remoteStreamRef.current = new MediaStream();
        }

        const alreadyHasTrack = remoteStreamRef
          .current!.getTracks()
          .some((t) => t.id === event.track.id);

        if (!alreadyHasTrack) {
          remoteStreamRef.current!.addTrack(event.track);
          console.log(
            "[WebRTC] track added to stream, total tracks:",
            remoteStreamRef.current!.getTracks().length,
          );
        }

        if (isNewStream) {
          // Trigger React state update only once (when stream is first created).
          // The live MediaStream reference then stays the same, avoiding repeated
          // srcObject replacements that cause AbortError.
          setRemoteStream(remoteStreamRef.current);
        }
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      peerConnectionRef.current = pc;
      return pc;
    },
    [socket],
  );

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
        playOutgoingRingtone();
        socket.emit("initiate-call", { receiverId, video });
      } catch (err) {
        console.error("Failed to get media devices", err);
        cleanup();
      }
    },
    [socket, cleanup],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "call-initiated",
      (data: { roomId: string; receiver: CallUser; video: boolean }) => {
        setRoomId(data.roomId);
        roomIdRef.current = data.roomId;
        setRemoteUser(data.receiver);
        remoteUserRef.current = data.receiver;
        setIsAudioOnly(!data.video);
        isAudioOnlyRef.current = !data.video;
      },
    );

    socket.on(
      "incoming-call",
      (data: { roomId: string; caller: CallUser; video: boolean }) => {
        setRoomId(data.roomId);
        roomIdRef.current = data.roomId;
        setRemoteUser(data.caller);
        remoteUserRef.current = data.caller;
        setIsAudioOnly(!data.video);
        isAudioOnlyRef.current = !data.video;
        setCallStatus(CallStatus.INCOMING);
        callStatusRef.current = CallStatus.INCOMING;

        // Audio Alert
        playRingtone();

        // Browser Notification
        if (Notification.permission === "granted") {
          const notification = new Notification(
            `Incoming Call from ${data.caller.username}`,
            {
              body: `Answer the ${data.video ? "video" : "audio"} call on MyLark`,
              icon: data.caller.avatar || "/favicon.ico",
              tag: "incoming-call",
              requireInteraction: true,
            },
          );

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
      },
    );

    socket.on(
      "call-accepted",
      async (data: {
        roomId: string;
        shouldCreateOffer: boolean;
        peerSocketId: string;
      }) => {
        stopRingtone();
        setCallStatus(CallStatus.ACCEPTED);
        callStatusRef.current = CallStatus.ACCEPTED;

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
        if (!localStreamRef.current) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: !isAudioOnlyRef.current,
              audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
          } catch (err) {
            console.error("Failed to get local stream in receive-offer", err);
            cleanup();
            return;
          }
        }
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
      stopRingtone();
      cleanup();
    });
    socket.on("call-ended", () => {
      const currentRemoteUser = remoteUserRef.current;
      // If we were receiving a call and the other side hung up, it's a missed call for us
      if (callStatusRef.current === CallStatus.INCOMING && currentRemoteUser) {
        socket.emit("send-message", {
          receiverId: currentRemoteUser.user_id,
          content: `__CALL_LOG__:MISSED_${isAudioOnlyRef.current ? "AUDIO" : "VIDEO"}`,
        });
      }
      stopRingtone();
      cleanup();
    });
    socket.on("call-missed", () => {
      const currentRemoteUser = remoteUserRef.current;
      if (callStatusRef.current === CallStatus.INCOMING && currentRemoteUser) {
        socket.emit("send-message", {
          receiverId: currentRemoteUser.user_id,
          content: `__CALL_LOG__:MISSED_${isAudioOnlyRef.current ? "AUDIO" : "VIDEO"}`,
        });
      }
      stopRingtone();
      cleanup();
    });

    socket.on(
      "call-mode-change",
      (data: { type: "audio" | "video"; enabled: boolean }) => {
        if (data.type === "audio") {
          setIsRemoteMuted(!data.enabled);
        } else {
          setIsRemoteVideoOff(!data.enabled);
        }
      },
    );

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
      socket.off("call-mode-change");
    };
  }, [socket, cleanup, createPeerConnection]);

  const acceptCall = useCallback(() => {
    const currentRoomId = roomIdRef.current;
    if (socket && currentRoomId)
      socket.emit("call-response", { roomId: currentRoomId, accept: true });
  }, [socket]);

  const rejectCall = useCallback(() => {
    const currentRoomId = roomIdRef.current;
    const currentRemoteUser = remoteUserRef.current;
    if (socket && currentRoomId && currentRemoteUser) {
      socket.emit("reject-call", { roomId: currentRoomId });
      socket.emit("send-message", {
        receiverId: currentRemoteUser.user_id,
        content: `__CALL_LOG__:MISSED_${isAudioOnlyRef.current ? "AUDIO" : "VIDEO"}`,
      });
    }
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    const currentRoomId = roomIdRef.current;
    const currentRemoteUser = remoteUserRef.current;
    if (socket && currentRoomId && currentRemoteUser) {
      socket.emit("end-call", { roomId: currentRoomId });
      if (callStatusRef.current === CallStatus.ACTIVE) {
        socket.emit("send-message", {
          receiverId: currentRemoteUser.user_id,
          content: `__CALL_LOG__:ENDED_${isAudioOnlyRef.current ? "AUDIO" : "VIDEO"}`,
        });
      }
    }
    cleanup();
  }, [socket, cleanup]);

  return (
    <CallContext.Provider
      value={{
        callStatus,
        localStream,
        remoteStream,
        remoteUser,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        isAudioOnly,
        isLocalMuted,
        isLocalVideoOff,
        isRemoteMuted,
        isRemoteVideoOff,
        toggleMute,
        toggleVideo,
        callDuration,
      }}
    >
      {children}
      <CallOverlay
        status={callStatus}
        localStream={localStream}
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        acceptCall={acceptCall}
        rejectCall={rejectCall}
        endCall={endCall}
        isAudioOnly={isAudioOnly}
        isLocalMuted={isLocalMuted}
        isLocalVideoOff={isLocalVideoOff}
        isRemoteMuted={isRemoteMuted}
        isRemoteVideoOff={isRemoteVideoOff}
        toggleMute={toggleMute}
        toggleVideo={toggleVideo}
        callDuration={callDuration}
      />
    </CallContext.Provider>
  );
};
