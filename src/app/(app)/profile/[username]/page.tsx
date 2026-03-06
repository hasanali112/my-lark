"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import Container from "@/components/layout/Container";

interface UserProfile {
  user_id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE";
  bio?: string | null;
  role?: string | null;
  phone?: string | null;
  location?: string | null;
  email?: string | null;
  createdAt?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);
  const isSelf = useMemo(
    () => (username ? ["me", "you"].includes(username.toLowerCase()) : false),
    [username],
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    role: "",
    bio: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = isSelf
          ? "/users/me"
          : `/users/profile/${encodeURIComponent(username)}`;

        const response = await apiFetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        const list = data.data || data;
        const match = isSelf ? list : list;

        if (!match) {
          setError("Profile not found");
          setProfile(null);
          return;
        }

        setProfile(match);
        setFormState({
          fullName: match.fullName || "",
          role: match.role || "",
          bio: match.bio || "",
          phone: match.phone || "",
          location: match.location || "",
        });
      } catch (err) {
        setError("Profile not found");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, isSelf]);

  const handleSave = async () => {
    if (!isSelf) return;
    try {
      const response = await apiFetch("/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      const updated = data.data || data;
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  return (
    <div className="px-6 pb-16">
      <Container>
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
          <section className="bg-white rounded-3xl border border-primary/15 shadow-sm">
            <div className="border-b border-primary/15 px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#9AA0AA] font-semibold">
                  Profile Card
                </p>
                <h2 className="text-xl font-semibold text-[#1F2329]">
                  {profile?.fullName || "Profile Details"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    profile?.status === "ONLINE"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {profile?.status === "ONLINE" ? "Active" : "Offline"}
                </span>
                {isSelf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing((prev) => !prev);
                      setError(null);
                    }}
                  >
                    {isEditing ? "Close" : "Edit"}
                  </Button>
                )}
              </div>
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
                      (
                        profile.fullName?.[0] ||
                        profile.username?.[0] ||
                        "?"
                      ).toUpperCase()
                    )}
                    {profile.status === "ONLINE" && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                            Full name
                          </label>
                          <input
                            value={formState.fullName}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-primary/15 px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                            Role
                          </label>
                          <input
                            value={formState.role}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-primary/15 px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                            Bio
                          </label>
                          <textarea
                            value={formState.bio}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full rounded-xl border border-primary/15 px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                              Phone
                            </label>
                            <input
                              value={formState.phone}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-primary/15 px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                              Location
                            </label>
                            <input
                              value={formState.location}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-primary/15 px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button onClick={handleSave}>Save</Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setFormState({
                                fullName: profile.fullName || "",
                                role: profile.role || "",
                                bio: profile.bio || "",
                                phone: profile.phone || "",
                                location: profile.location || "",
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-semibold text-[#1F2329]">
                          {profile.fullName || profile.username}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          @{profile.username}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#64748B]">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                            {profile.role || "Member"}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                            Available for chat
                          </span>
                        </div>
                        {profile.bio && (
                          <p className="mt-4 text-sm text-[#6B7280]">
                            {profile.bio}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {!isSelf && (
                    <div className="flex flex-col gap-2">
                      <Button>Send Message</Button>
                      <Button variant="outline">Add Connection</Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">Profile unavailable.</p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-primary/15 shadow-sm px-6 py-6">
              <h3 className="text-lg font-semibold text-[#1F2329]">Contact</h3>
              <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <span className="font-medium text-[#1F2329]">
                    {profile?.email || "Not shared"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone</span>
                  <span className="font-medium text-[#1F2329]">
                    {profile?.phone || "Not shared"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-medium text-[#1F2329]">
                    {profile?.location || "Not set"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-primary/15 shadow-sm px-6 py-6">
              <h3 className="text-lg font-semibold text-[#1F2329]">Activity</h3>
              <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <span>Last active</span>
                  <span className="font-medium text-[#1F2329]">Just now</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Joined</span>
                  <span className="font-medium text-[#1F2329]">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-medium text-primary">
                    {profile?.status === "ONLINE" ? "Active" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
