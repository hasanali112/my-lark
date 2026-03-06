"use client";

import Link from "next/link";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Container from "./Container";

const Navbar = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));
    setIsAuthed(Boolean(token));
  }, []);

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
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAuthed(false);
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
              <span className="text-white font-bold">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1F2329] group-hover:text-primary transition-colors">
              UrbanSync
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
            {isAuthed ? (
              <div className="relative">
                <button
                  className="w-9 h-9 rounded-full bg-primary text-white font-semibold text-xs flex items-center justify-center"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  U
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#DEE0E3] bg-white shadow-lg py-2 text-sm">
                    <Link
                      href="/community"
                      className="block px-4 py-2 text-[#1F2329] hover:bg-[#F5F6F7]"
                    >
                      Community
                    </Link>
                    <Link
                      href="/community/profile/me"
                      className="block px-4 py-2 text-[#1F2329] hover:bg-[#F5F6F7]"
                    >
                      Profile
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
