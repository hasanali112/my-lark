import React from "react";
import Image from "next/image";

interface ConversationViewProps {
  activeUser: {
    userId: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
}

const ConversationView = ({ activeUser }: ConversationViewProps) => {
  const messages = [
    {
      id: 1,
      sender: "Sarah",
      content: "The latest urban development data just came in for district 4.",
      time: "9:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "Hasan",
      content: "Great, let me take a look at the energy consumption charts.",
      time: "9:31 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Sarah",
      content:
        "I notice a spike in traffic demand near the new tech park. We might need to adjust the automated routing.",
      time: "10:15 AM",
      isOwn: false,
    },
    {
      id: 4,
      sender: "Sarah",
      content: "Sending the updated routing parameters now.",
      time: "10:16 AM",
      isOwn: false,
    },
    {
      id: 5,
      sender: "Hasan",
      content:
        "Received. Calibrating the sensors now. Will push live in 5 mins.",
      time: "10:42 AM",
      isOwn: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <header className="px-6 py-4 border-b border-[#DEE0E3] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={activeUser.avatar}
                alt={activeUser.name}
                width={40}
                height={40}
              />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${activeUser.isOnline ? "bg-green-500" : "bg-gray-400"}`}
            ></div>
          </div>
          <div className="ml-3">
            <h2 className="text-sm font-bold text-[#1F2329]">
              {activeUser.name}
            </h2>
            <p
              className={`text-[10px] font-medium ${activeUser.isOnline ? "text-green-600" : "text-[#646A73]"}`}
            >
              {activeUser.isOnline ? "Online • 4 members" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F6F7]/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            {!msg.isOwn && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2 mt-1 shrink-0">
                <Image
                  src="https://i.pravatar.cc/100?img=11"
                  alt={msg.sender}
                  width={32}
                  height={32}
                />
              </div>
            )}
            <div className={`group relative flex-1`}>
              <div
                className={`p-4 rounded-2xl text-sm ${
                  msg.isOwn
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white text-[#1F2329] border border-[#DEE0E3] rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
              <p
                className={`text-[10px] text-[#646A73] mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center space-x-2 text-[#646A73] text-[10px] opacity-60">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span>Sarah Jenkins is typing...</span>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-white border-t border-[#DEE0E3] shrink-0">
        <div className="flex items-end space-x-4">
          <div className="flex-1 flex items-center space-x-3 bg-[#F5F6F7] rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <button className="text-[#646A73] hover:text-primary transition-colors">
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
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none resize-none text-sm outline-none max-h-32 placeholder-[#646A73]/60"
            />
            <button className="text-[#646A73] hover:text-primary transition-colors">
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
          <button className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0">
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
      </div>
    </div>
  );
};

export default ConversationView;
