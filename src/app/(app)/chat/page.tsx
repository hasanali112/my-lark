"use client";

import React from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ConversationView from "@/components/chat/ConversationView";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
  const currentUserId = "990b9287-bf5b-4b4f-b2d8-60cad3bebe20"; // TODO: get this dynamically from Auth Context
  const { isConnected, onlineUsers } = useSocket(currentUserId);
  const [selectedFriend, setSelectedFriend] = React.useState<any>(null);

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
    <>
      <ChatSidebar
        isConnected={isConnected}
        onlineUsers={onlineUsers}
        onSelectFriend={setSelectedFriend}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {activeUser ? (
          <ConversationView activeUser={activeUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a friend from the sidebar to start chatting</p>
          </div>
        )}
      </main>
    </>
  );
}
