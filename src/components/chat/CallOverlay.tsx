"use client";

import React, { useEffect, useRef } from "react";
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
}: CallOverlayProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (status === CallStatus.IDLE) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fade-in shadow-2xl backdrop-blur-sm">
      <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex flex-col items-center justify-center p-8">
        {/* Remote Video / Avatar */}
        <div className="relative w-full h-full bg-[#1F2329] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!isAudioOnly && remoteStream ? "block" : "hidden"}`}
          />

          {(isAudioOnly || !remoteStream) && (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/50 shadow-xl animate-pulse">
                <Image
                  src={
                    remoteUser?.avatar ||
                    `https://ui-avatars.com/api/?name=${remoteUser?.username}&background=random`
                  }
                  alt={remoteUser?.username || "User"}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {remoteUser?.username}
                </h2>
                <p className="text-primary font-medium animate-pulse">
                  {status === CallStatus.INITIATING && "Calling..."}
                  {status === CallStatus.INCOMING && "Incoming call..."}
                  {status === CallStatus.ACCEPTED && "Connecting..."}
                  {status === CallStatus.ACTIVE && "In Call"}
                </p>
              </div>
            </div>
          )}

          {/* Local Mini-Preview */}
          {!isAudioOnly && localStream && status !== CallStatus.INCOMING && (
            <div className="absolute top-6 right-6 w-48 h-32 bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl group transition-all hover:scale-105">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center space-x-8">
          {status === CallStatus.INCOMING ? (
            <>
              <button
                onClick={rejectCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-8 h-8 rotate-[135deg]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
              <button
                onClick={acceptCall}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <svg
                  className="w-6 h-6"
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
              </button>

              <button
                onClick={endCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-8 h-8 rotate-[135deg]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>

              <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <svg
                  className="w-6 h-6"
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
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
