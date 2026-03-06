import React, { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

interface Friend {
  user_id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE";
}

interface ChatSidebarProps {
  isConnected: boolean;
  onlineUsers: string[];
  onSelectFriend: (friend: Friend) => void;
}

const ChatSidebar = ({
  isConnected,
  onlineUsers,
  onSelectFriend,
}: ChatSidebarProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await apiFetch("/friends", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const list = data.data || data;
          setFriends(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Failed to fetch friends", error);
      }
    };
    fetchFriends();
  }, []);

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const filteredFriends = friends.filter((f) =>
    (f.fullName || f.username)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="w-80 border-r border-[#DEE0E3] bg-white flex flex-col shrink-0 flex-none relative z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#DEE0E3]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#1F2329]">Messages</h1>
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${isConnected ? "bg-green-100 text-green-600 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"}`}
          >
            {isConnected ? "LIVE" : "OFFLINE"}
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F6F7] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-[#646A73]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4 pt-10 px-4">
            No friends found. Go to the "Find Friends" section to connect with
            people.
          </p>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.user_id}
              onClick={() => onSelectFriend(friend)}
              className="flex items-center p-4 cursor-pointer hover:bg-[#F5F6F7] transition-colors border-l-4 border-transparent"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {friend.avatar ? (
                    <Image
                      src={friend.avatar}
                      alt={friend.username}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    (friend.fullName?.[0] || friend.username[0]).toUpperCase()
                  )}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isUserOnline(friend.user_id) ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold truncate text-[#1F2329]">
                    {friend.fullName || friend.username}
                  </h3>
                </div>
                <p className="text-xs text-[#646A73] truncate leading-tight">
                  @{friend.username}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-[#DEE0E3] bg-[#F5F6F7]/50 flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
          H
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#1F2329] truncate">
            Hasan Al Khalid
          </p>
          <p className="text-[10px] text-[#646A73] truncate">Administrator</p>
        </div>
        <button className="text-[#646A73] hover:text-[#1F2329]">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
