"use client";
import React, { useState, useEffect, useRef } from "react";

import Image from "next/image";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUser } from "@/providers/UserProvider";
import { apiFetch } from "@/lib/api";
import { useWebRTC } from "@/hooks/useWebRTC";
import CallOverlay from "./CallOverlay";

interface Message {
  message_id: string;
  content: string;
  sender_id: string;
  createdAt: string;
  sender: {
    user_id: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
  };
}

interface ConversationViewProps {
  activeUser: {
    userId: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  onBack?: () => void;
}

const ConversationView = ({ activeUser, onBack }: ConversationViewProps) => {
  const { socket } = useSocketContext();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    callStatus,
    localStream,
    remoteStream,
    remoteUser,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    isAudioOnly,
  } = useWebRTC();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch History
  useEffect(() => {
    if (!activeUser?.userId) return;
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/messages/history/${activeUser.userId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.data || data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, [activeUser.userId]);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Only add message if it belongs to the current conversation
      if (
        message.sender_id === activeUser.userId ||
        message.sender_id === user?.user_id
      ) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          if (prev.some((m) => m.message_id === message.message_id))
            return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, activeUser.userId, user?.user_id]);

  const handleSendMessage = (e: React.FormEvent | React.KeyboardEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if ("key" in e && e.shiftKey) return;
    e.preventDefault();

    if (!newMessage.trim() || !socket) return;

    socket.emit("send-message", {
      receiverId: activeUser.userId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <header className="px-6 py-4 border-b border-[#DEE0E3] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-4 p-1 text-[#646A73] hover:text-primary transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="flex items-center min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  width={40}
                  height={40}
                  className="object-cover h-full w-full"
                />
              </div>
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${activeUser.isOnline ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
            </div>
            <div className="ml-3 truncate">
              <h2 className="text-sm font-bold text-[#1F2329] truncate">
                {activeUser.name}
              </h2>
              <p
                className={`text-[10px] font-medium ${activeUser.isOnline ? "text-green-600" : "text-[#646A73]"}`}
              >
                {activeUser.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => initiateCall(activeUser.userId, false)}
            className="text-[#646A73] hover:text-primary transition-colors"
            title="Audio Call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            onClick={() => initiateCall(activeUser.userId, true)}
            className="text-[#646A73] hover:text-primary transition-colors"
            title="Video Call"
          >
            <svg
              className="w-5 h-5"
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
          <div className="h-6 w-px bg-[#DEE0E3]"></div>
          <button className="text-[#646A73] hover:text-primary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F6F7]/30 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">
              No messages yet. Send a wave! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.user_id;
            return (
              <div
                key={msg.message_id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2 mt-1 shrink-0">
                    <Image
                      src={
                        msg.sender.avatar ||
                        `https://ui-avatars.com/api/?name=${msg.sender.username}&background=random`
                      }
                      alt={msg.sender.username}
                      width={32}
                      height={32}
                      className="object-cover h-full w-full"
                    />
                  </div>
                )}
                <div className={`group relative max-w-[80%]`}>
                  <div
                    className={`p-4 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white text-[#1F2329] border border-[#DEE0E3] rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p
                    className={`text-[10px] text-[#646A73] mt-1 ${isOwn ? "text-right" : "text-left"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-6 bg-white border-t border-[#DEE0E3] shrink-0"
      >
        <div className="flex items-end space-x-4">
          <div className="flex-1 flex items-center space-x-3 bg-[#F5F6F7] rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <button
              type="button"
              className="text-[#646A73] hover:text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <textarea
              rows={1}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none resize-none text-sm outline-none max-h-32 placeholder-[#646A73]/60"
            />
            <button
              type="button"
              className="text-[#646A73] hover:text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50 disabled:shadow-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#646A73]/60 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>

      {/* WebRTC Call Overlay */}
      <CallOverlay
        status={callStatus}
        localStream={localStream}
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        acceptCall={acceptCall}
        rejectCall={rejectCall}
        endCall={endCall}
        isAudioOnly={isAudioOnly}
      />
    </div>
  );
};

export default ConversationView;
