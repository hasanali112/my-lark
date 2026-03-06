import React from 'react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F5F6F7] overflow-hidden">
      {children}
    </div>
  );
}
