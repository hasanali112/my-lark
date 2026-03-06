"use client";

import React from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ConversationView from "@/components/chat/ConversationView";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUser } from "@/providers/UserProvider";
import Container from "@/components/layout/Container";

export default function ChatPage() {
  const { isConnected, onlineUsers, socket } = useSocketContext();
  const { user } = useUser();
  const [selectedFriend, setSelectedFriend] = React.useState<any>(null);
  const [unreadCounts, setUnreadCounts] = React.useState<
    Record<string, number>
  >({});

  // Listen for new messages globally in the chat page to track unreads
  React.useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // If the message is from someone else and they are NOT the active chat, mark as unread
      if (
        message.sender_id !== user?.user_id &&
        (!selectedFriend || selectedFriend.user_id !== message.sender_id)
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender_id]: (prev[message.sender_id] || 0) + 1,
        }));
      }
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedFriend, user?.user_id]);

  const handleSelectFriend = (friend: any) => {
    setSelectedFriend(friend);
    // Clear unreads for this friend
    setUnreadCounts((prev) => {
      const next = { ...prev };
      delete next[friend.user_id];
      return next;
    });
  };

  // Map selected friend to activeUser format expected by ConversationView
  const activeUser = selectedFriend
    ? {
        userId: selectedFriend.user_id,
        name: selectedFriend.fullName || selectedFriend.username,
        avatar:
          selectedFriend.avatar ||
          `https://ui-avatars.com/api/?name=${selectedFriend.fullName || selectedFriend.username}&background=random`,
        isOnline: onlineUsers.includes(selectedFriend.user_id),
      }
    : null;

  return (
    <Container className="h-full px-0 sm:px-2 md:px-6 lg:px-8 py-0 md:py-4">
      <div className="flex h-full bg-white border border-primary/15 rounded-2xl md:rounded-2xl overflow-hidden shadow-sm relative">
        <div
          className={`w-full md:w-80 shrink-0 ${selectedFriend ? "hidden md:flex" : "flex"} flex-col h-full`}
        >
          <ChatSidebar
            isConnected={isConnected}
            onlineUsers={onlineUsers}
            onSelectFriend={handleSelectFriend}
            unreadCounts={unreadCounts}
          />
        </div>
        <main
          className={`flex-1 ${selectedFriend ? "flex" : "hidden md:flex"} flex-col min-w-0 bg-white min-h-0 overflow-hidden`}
        >
          {activeUser ? (
            <ConversationView
              activeUser={activeUser}
              onBack={() => setSelectedFriend(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Select a friend from the sidebar to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </Container>
  );
}
