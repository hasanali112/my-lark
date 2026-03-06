"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

interface UserProfile {
  user_id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE";
}

export default function ProfilePage() {
  const params = useParams();
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1];

        const response = await fetch(
          `http://localhost:8000/api/v1/users/search?q=${encodeURIComponent(
            username,
          )}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        const list = data.data || data;
        const match = Array.isArray(list)
          ? list.find(
              (item) =>
                item.username?.toLowerCase() === username.toLowerCase(),
            )
          : null;

        if (!match) {
          setError("Profile not found");
          setProfile(null);
          return;
        }

        setProfile(match);
      } catch (err) {
        setError("Profile not found");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  return (
    <div className="px-6 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9AA0AA] font-semibold">
            Profile
          </p>
          <h1 className="text-3xl font-semibold text-[#1F2329]">
            Member Overview
          </h1>
          <p className="text-sm text-[#6B7280] mt-2">
            View profile details, availability, and connection actions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm">
            <div className="border-b border-[#E5E7EB] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#9AA0AA] font-semibold">
                  Profile Card
                </p>
                <h2 className="text-xl font-semibold text-[#1F2329]">
                  {profile?.fullName || "Profile Details"}
                </h2>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  profile?.status === "ONLINE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile?.status === "ONLINE" ? "Active" : "Offline"}
              </span>
            </div>

            <div className="px-6 py-8">
              {isLoading ? (
                <p className="text-sm text-[#6B7280]">Loading profile...</p>
              ) : error ? (
                <p className="text-sm text-[#6B7280]">{error}</p>
              ) : profile ? (
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-semibold overflow-hidden">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.username}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      (profile.fullName?.[0] || profile.username[0]).toUpperCase()
                    )}
                    {profile.status === "ONLINE" && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-semibold text-[#1F2329]">
                      {profile.fullName || profile.username}
                    </h3>
                    <p className="text-sm text-[#6B7280]">@{profile.username}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#64748B]">
                      <span className="px-3 py-1 rounded-full bg-[#F3F4F6]">
                        Member
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
                        Available for chat
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button>Send Message</Button>
                    <Button variant="outline">Add Connection</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">Profile unavailable.</p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm px-6 py-6">
              <h3 className="text-lg font-semibold text-[#1F2329]">
                Contact
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <span className="font-medium text-[#1F2329]">Not shared</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone</span>
                  <span className="font-medium text-[#1F2329]">Not shared</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-medium text-[#1F2329]">Not set</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm px-6 py-6">
              <h3 className="text-lg font-semibold text-[#1F2329]">
                Activity
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <span>Last active</span>
                  <span className="font-medium text-[#1F2329]">Just now</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connections</span>
                  <span className="font-medium text-[#1F2329]">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Requests</span>
                  <span className="font-medium text-[#1F2329]">—</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
