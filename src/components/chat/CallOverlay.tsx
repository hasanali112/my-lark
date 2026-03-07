"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CallStatus } from "@/hooks/useWebRTC";

interface CallOverlayProps {
  status: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteUser: {
    username: string;
    avatar: string | null;
  } | null;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  isAudioOnly: boolean;
  isLocalMuted: boolean;
  isLocalVideoOff: boolean;
  isRemoteMuted: boolean;
  isRemoteVideoOff: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  callDuration: number;
}

// ─── Network quality badge (poor / fair / good) ──────────────────────────────
type NetworkQuality = "good" | "fair" | "poor" | null;

const NetworkBadge = ({ quality }: { quality: NetworkQuality }) => {
  if (!quality) return null;
  const colors: Record<NonNullable<NetworkQuality>, string> = {
    good: "bg-green-500/80",
    fair: "bg-yellow-400/80",
    poor: "bg-red-500/80",
  };
  const labels: Record<NonNullable<NetworkQuality>, string> = {
    good: "Good signal",
    fair: "Fair signal",
    poor: "Poor signal",
  };
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold text-white/90 ${colors[quality]} backdrop-blur-md`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${quality === "good" ? "bg-green-200" : quality === "fair" ? "bg-yellow-200" : "bg-red-200"} animate-pulse`}
      />
      {labels[quality]}
    </div>
  );
};

const CallOverlay = ({
  status,
  localStream,
  remoteStream,
  remoteUser,
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
}: CallOverlayProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // ─── Network quality monitoring ─────────────────────────────────────────────
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (status !== CallStatus.ACTIVE || !remoteStream) {
      setNetworkQuality(null);
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      return;
    }

    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;

    statsIntervalRef.current = setInterval(() => {
      if (!videoEl) return;
      const tracks = remoteStream.getVideoTracks();
      if (tracks.length === 0) return;

      const track = tracks[0];
      if (track.readyState === "ended") {
        setNetworkQuality("poor");
      } else if (videoEl.readyState >= 3) {
        setNetworkQuality("good");
      } else if (videoEl.readyState >= 1) {
        setNetworkQuality("fair");
      } else {
        setNetworkQuality("poor");
      }
    }, 3000);

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    };
  }, [status, remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: initialPos.current.x + dx,
      y: initialPos.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const latestRemoteStreamRef = useRef<MediaStream | null>(null);
  latestRemoteStreamRef.current = remoteStream;

  const safePlay = (video: HTMLVideoElement) => {
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[CallOverlay] play() failed:", err);
      });
    }
  };

  const assignRemoteVideo = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && latestRemoteStreamRef.current) {
      node.srcObject = latestRemoteStreamRef.current;
      safePlay(node);
    }
  }, []);

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    if (remoteStream) {
      video.srcObject = remoteStream;
      safePlay(video);
    } else {
      video.srcObject = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (bgVideoRef.current) {
      if (
        (status === CallStatus.INITIATING || status === CallStatus.ACCEPTED) &&
        localStream
      ) {
        bgVideoRef.current.srcObject = localStream;
      } else if (status === CallStatus.ACTIVE && remoteStream) {
        bgVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [localStream, remoteStream, status]);

  if (status === CallStatus.IDLE) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={bgVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-1000 ${
            (status === CallStatus.ACTIVE && isRemoteVideoOff) ||
            (status !== CallStatus.ACTIVE && isLocalVideoOff)
              ? "opacity-40"
              : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
      </div>

      {/* Main Remote Video (Full Screen) — always mounted */}
      <div
        className={`absolute inset-0 z-1 transition-opacity duration-500 ${
          status === CallStatus.ACTIVE && !isAudioOnly
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <video
          ref={assignRemoteVideo}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 w-full h-full max-w-5xl flex flex-col items-center justify-between p-6 md:p-12">
        {/* Top — caller info */}
        <div className="w-full flex flex-col items-center mt-10 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          {(isAudioOnly ||
            !remoteStream ||
            isRemoteVideoOff ||
            status !== CallStatus.ACTIVE) && (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-gray-800 transition-all duration-500">
              <Image
                src={
                  remoteUser?.avatar ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt={remoteUser?.username || "Companion"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {remoteUser?.username || "Companion"}
            </h2>
            <div className="flex flex-col items-center mt-1">
              <p className="text-sm md:text-base text-white/60 font-medium">
                {status === CallStatus.INITIATING
                  ? "Calling..."
                  : status === CallStatus.INCOMING
                    ? "Incoming Call"
                    : status === CallStatus.ACCEPTED
                      ? "Connecting..."
                      : (isAudioOnly ? "Audio Call " : "Video Call ") +
                        (isAudioOnly ? "" : formatDuration(callDuration))}
              </p>
            </div>

            {/* Network quality badge — only shown during active call */}
            {status === CallStatus.ACTIVE && (
              <div className="flex justify-center mt-2">
                <NetworkBadge quality={networkQuality} />
              </div>
            )}

            {/* Remote muted indicator */}
            {isRemoteMuted && status === CallStatus.ACTIVE && (
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold text-white/80 bg-white/10 backdrop-blur-md">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM3 3l18 18"
                    />
                  </svg>
                  Muted
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Mini-Preview — Draggable */}
        {localStream && status !== CallStatus.INCOMING && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              touchAction: "none",
            }}
            className={`absolute right-6 top-6 w-32 h-44 md:w-48 md:h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-50 transition-all duration-300 ${
              isDragging ? "scale-105 cursor-grabbing" : "cursor-grab"
            }`}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-gray-900"
            />
            {isLocalVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <svg
                    className="w-6 h-6 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2zM3 3l18 18"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white/80 font-medium">
              You
            </div>
            {isLocalMuted && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM3 3l18 18"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl flex items-center justify-around animate-in fade-in slide-in-from-bottom duration-700">
          {status === CallStatus.INCOMING ? (
            <>
              <button
                onClick={rejectCall}
                className="w-14 h-14 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8 rotate-[135deg]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
              <button
                onClick={acceptCall}
                className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 hover:scale-110 active:scale-95 animate-bounce"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                  isLocalVideoOff
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isLocalVideoOff ? "Turn Video On" : "Turn Video Off"}
              >
                {isLocalVideoOff ? (
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2zM3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleMute}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                  isLocalMuted
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isLocalMuted ? "Unmute" : "Mute"}
              >
                {isLocalMuted ? (
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={endCall}
                className="w-14 h-14 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8 rotate-[135deg]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
              <button className="hidden sm:flex w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-full items-center justify-center text-white hover:bg-white/20 transition-all">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
