"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
const NAMESPACE = "/webrtc";

export const useSocket = (userId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Connect to the socket with userId as a query parameter
    const socket = io(`${SOCKET_URL}${NAMESPACE}`, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
      setIsConnected(false);
    });

    // Listen for online users updates (naming depends on backend implementation)
    // Common event name is 'online-users' or 'status-update'
    socket.on("online-users", (users: string[]) => {
      setOnlineUsers(users);
    });

    // Handle single user status updates
    socket.on(
      "user-status",
      ({
        userId: updatedUserId,
        status,
      }: {
        userId: string;
        status: "online" | "offline";
      }) => {
        setOnlineUsers((prev) => {
          if (status === "online") {
            return prev.includes(updatedUserId)
              ? prev
              : [...prev, updatedUserId];
          } else {
            return prev.filter((id) => id !== updatedUserId);
          }
        });
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
  };
};
