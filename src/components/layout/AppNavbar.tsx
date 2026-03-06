"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "./Container";
import { useUser } from "@/providers/UserProvider";
import { useSocketContext } from "@/providers/SocketProvider";

const AppNavbar = () => {
  const { user, isLoading } = useUser();
  const { isConnected } = useSocketContext();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-primary/15">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-semibold text-lg">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F2329]">MyLark</p>
            <p className="text-[11px] text-[#6B7280]">Workspace</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#6B7280]">
          <Link href="/community" className="hover:text-primary">
            Community
          </Link>
          <Link href="/community/chat" className="hover:text-primary">
            Messages
          </Link>
          <Link href="/community/friends" className="hover:text-primary">
            People
          </Link>
          <Link
            href={`/profile/${user?.username || "me"}`}
            className="hover:text-primary"
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {isConnected ? "Online" : "Away"}
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              />
            </div>
          )}

          <Link href={`/profile/${user?.username || "me"}`}>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden border border-primary/10 hover:border-primary/30 transition-all">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              ) : (
                (
                  user?.fullName?.[0] ||
                  user?.username?.[0] ||
                  "?"
                ).toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </Container>
    </nav>
  );
};

export default AppNavbar;
