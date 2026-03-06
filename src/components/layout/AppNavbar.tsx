"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "./Container";
import { useUser } from "@/providers/UserProvider";
import { useSocketContext } from "@/providers/SocketProvider";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const AppNavbar = () => {
  const { user, refreshUser, isLoading } = useUser();
  const { isConnected } = useSocketContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        skipAuthRefresh: true,
      });
    } catch (error) {
      // noop
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setIsMenuOpen(false);
      window.location.href = "/auth/login";
    }
  };

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
          <Link
            href="/community"
            className="hover:text-primary transition-colors"
          >
            Community
          </Link>
          <Link
            href="/community/chat"
            className="hover:text-primary transition-colors"
          >
            Messages
          </Link>
          <Link
            href="/community/friends"
            className="hover:text-primary transition-colors"
          >
            People
          </Link>
          <Link
            href={`/profile/${user?.username || "me"}`}
            className="hover:text-primary transition-colors"
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

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden border border-primary/10 hover:border-primary/30 transition-all focus:outline-none"
            >
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
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#DEE0E3] bg-white shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 pb-2 mb-2 border-b border-[#F5F6F7]">
                  <p className="text-sm font-bold text-[#1F2329] truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-[11px] text-[#646A73] truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="md:hidden">
                  <Link
                    href="/community"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
                  >
                    Community
                  </Link>
                  <Link
                    href="/community/chat"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
                  >
                    Messages
                  </Link>
                  <Link
                    href="/community/friends"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
                  >
                    People
                  </Link>
                </div>

                <Link
                  href={`/profile/${user?.username || "me"}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
                >
                  My Profile
                </Link>

                <div className="mt-2 pt-2 border-t border-[#F5F6F7]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default AppNavbar;
