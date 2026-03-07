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
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  // Safe play helper: ignores AbortError (caused by rapid src changes / element removal)
  const safePlay = (video: HTMLVideoElement) => {
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Silently ignore – element was updated before play() completed
          return;
        }
        console.warn("[CallOverlay] play() failed:", err);
      });
    }
  };

  // Callback ref for remote video – NO stream dependency so the element is
  // never re-created when the stream updates (avoids unmount → AbortError).
  const assignRemoteVideo = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteVideoRef.current?.srcObject) {
      safePlay(node);
    }
  }, []);

  // Update remote video srcObject whenever the stream changes.
  // The video element stays in the DOM; only srcObject is swapped.
  useEffect(() => {
    const video = remoteVideoRef.current;
    if (video && remoteStream) {
      console.log(
        "[CallOverlay] Updating remote srcObject",
        remoteStream.getTracks(),
      );
      video.srcObject = remoteStream;
      safePlay(video);
    }
  }, [remoteStream]);

  // Imperatively set srcObject whenever the local stream changes
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

  const showRemoteVideo = !isAudioOnly && remoteStream && !isRemoteVideoOff;
  const showLocalVideo = !isAudioOnly && localStream && !isLocalVideoOff;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in overflow-hidden">
      {/* Dynamic Background Mirror / Placeholder */}
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

      {/* Main Remote Video (Full Screen) – always mounted so browser never
          cancels play() due to element removal during status transitions. */}
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
        {!isAudioOnly && <div className="absolute inset-0 bg-black/10" />}
      </div>

      <div className="relative z-10 w-full h-full max-w-5xl flex flex-col items-center justify-between p-6 md:p-12">
        {/* Top Info - Caller Details */}
        <div className="w-full flex flex-col items-center mt-10 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          {(isAudioOnly ||
            !remoteStream ||
            isRemoteVideoOff ||
            status !== CallStatus.ACTIVE) && (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-gray-800 transition-all duration-500 scale-100 hover:scale-105">
              <Image
                src={
                  remoteUser?.avatar ||
                  `https://ui-avatars.com/api/?name=${remoteUser?.username}&background=random`
                }
                alt={remoteUser?.username || "User"}
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="text-center drop-shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              {remoteUser?.username}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <p className="text-primary-light font-semibold text-lg drop-shadow-md">
                {status === CallStatus.INITIATING && "Calling..."}
                {status === CallStatus.INCOMING && "Incoming Video Call..."}
                {status === CallStatus.ACCEPTED && "Connecting..."}
                {status === CallStatus.ACTIVE &&
                  (isRemoteVideoOff
                    ? "Video Paused"
                    : formatDuration(callDuration))}
              </p>
            </div>
          </div>
        </div>

        {/* Local Mini-Preview - Draggable */}
        {localStream && status !== CallStatus.INCOMING && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              touchAction: "none",
            }}
            className={`absolute top-8 right-8 w-32 h-44 md:w-56 md:h-72 bg-gray-900 border-2 border-white/20 shadow-2xl z-30 transition-shadow rounded-3xl overflow-hidden cursor-move ${isDragging ? "shadow-white/10 ring-2 ring-white/20" : ""}`}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${!isLocalVideoOff ? "opacity-100" : "opacity-0"}`}
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
          </div>
        )}

        {/* Controls Bar */}
        <div className="mt-8 md:mt-12 bg-white/10 backdrop-blur-xl px-6 md:px-10 py-4 md:py-6 rounded-3xl border border-white/10 flex items-center gap-4 md:gap-8 shadow-2xl animate-slide-up">
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
              {/* Toggle Video */}
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${isLocalVideoOff ? "bg-red-500/20 text-red-500 border border-red-500/50" : "bg-white/10 text-white hover:bg-white/20 border border-white/5"}`}
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

              {/* Toggle Mute */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${isLocalMuted ? "bg-red-500/20 text-red-500 border border-red-500/50" : "bg-white/10 text-white hover:bg-white/20 border border-white/5"}`}
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

              {/* End Call */}
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

              {/* Speaker Toggle (Placeholder/Decorative) */}
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
