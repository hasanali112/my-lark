"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Container from "@/components/layout/Container";

export default function CommunityPage() {
  const [stats, setStats] = useState({
    newMessages: 0,
    pendingRequests: 0,
    connections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiFetch("/users/community-stats");
        if (!response.ok) return;
        const data = await response.json();
        const payload = data.data || data;
        setStats({
          newMessages: payload.newMessages ?? 0,
          pendingRequests: payload.pendingRequests ?? 0,
          connections: payload.connections ?? 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="px-6 pb-16">
      <Container>
        <header className="bg-white rounded-2xl border border-primary/15 shadow-sm px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9AA0AA] font-semibold">
                Community
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#1F2329]">
                Community Hub
              </h1>
              <p className="text-sm text-[#6B7280] mt-2">
                A single place to manage your messages, people, and profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-primary">
              <span className="px-3 py-2 rounded-xl border border-primary/20 bg-primary/5">
                Workspace: MyLark
              </span>
              <span className="px-3 py-2 rounded-xl border border-primary/20 bg-primary/5">
                Status: Online
              </span>
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="space-y-4">
            <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#1F2329]">
                Quick Actions
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Jump directly into the most important areas.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
                <Link
                  href="/community/chat"
                  className="rounded-2xl border border-primary/20 bg-primary text-white px-4 py-4 flex flex-col gap-2"
                >
                  <span>Messages</span>
                  <span className="text-xs text-white/80">
                    Continue your conversations
                  </span>
                </Link>
                <Link
                  href="/community/friends"
                  className="rounded-2xl border border-primary/20 bg-primary/5 text-primary px-4 py-4 flex flex-col gap-2"
                >
                  <span>People</span>
                  <span className="text-xs text-primary/80">
                    Manage connections
                  </span>
                </Link>
                <Link
                  href="/community/profile/me"
                  className="rounded-2xl border border-primary/20 bg-primary/5 text-primary px-4 py-4 flex flex-col gap-2"
                >
                  <span>Profile</span>
                  <span className="text-xs text-primary/80">
                    Update your details
                  </span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#1F2329]">
                Recent Activity
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                A quick glance at what matters most today.
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-3">
                  <span>New messages</span>
                  <span className="font-semibold text-[#1F2329]">
                    {isLoading ? "—" : stats.newMessages}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-3">
                  <span>Pending requests</span>
                  <span className="font-semibold text-[#1F2329]">
                    {isLoading ? "—" : stats.pendingRequests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-3">
                  <span>Active connections</span>
                  <span className="font-semibold text-[#1F2329]">
                    {isLoading ? "—" : stats.connections}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#1F2329]">
                Profile Snapshot
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Keep your information up to date.
              </p>
              <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-semibold flex items-center justify-center">
                    U
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2329]">
                      UrbanSync Member
                    </p>
                    <p className="text-sm text-[#6B7280]">@you</p>
                  </div>
                </div>
                <Link
                  href="/community/profile/me"
                  className="mt-4 inline-flex text-sm font-semibold text-primary"
                >
                  Edit profile
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#1F2329]">
                Community Guidelines
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Keep the space professional and helpful.
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                <p>Be respectful and inclusive.</p>
                <p>Share updates with clarity and purpose.</p>
                <p>Keep conversations organized.</p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
