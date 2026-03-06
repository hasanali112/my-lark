"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "../ui/Button";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Container from "./Container";
import { useUser } from "@/providers/UserProvider";

const Navbar = () => {
  const { user, refreshUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        // Clear the auth_token cookie as well
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setIsMenuOpen(false);
      window.location.href = "/auth/login";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-4">
      <Container>
        <div className="bg-white/80 backdrop-blur-md w-full px-6 py-3 flex items-center justify-between rounded-full border border-[#DEE0E3] shadow-sm">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1F2329] group-hover:text-primary transition-colors">
              MyLark
            </span>
          </Link>

          {/* Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#646A73]">
            <Link href="#" className="hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Technology
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Case Studies
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center overflow-hidden border border-primary/10 hover:border-primary/30 transition-all"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  ) : (
                    (user.fullName?.[0] || user.username[0]).toUpperCase()
                  )}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#DEE0E3] bg-white shadow-lg py-2 text-sm">
                    <Link
                      href="/community"
                      className="block px-4 py-2 text-[#1F2329] hover:bg-[#F5F6F7]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Community
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-[#D14343] hover:bg-[#F5F6F7]"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block text-sm font-medium text-[#646A73] hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
