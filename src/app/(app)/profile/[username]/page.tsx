"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import Container from "@/components/layout/Container";
import { useUser } from "@/providers/UserProvider";
import { useSocketContext } from "@/providers/SocketProvider";

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
  const { user, refreshUser } = useUser();
  const { onlineUsers } = useSocketContext();
  const params = useParams();
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);
  const isSelf = useMemo(
    () =>
      username
        ? ["me", "you"].includes(username.toLowerCase()) ||
          username.toLowerCase() === user?.username?.toLowerCase()
        : false,
    [username, user?.username],
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isSelf) return;

    setIsUploadingAvatar(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiFetch("/users/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      const updated = data.data || data;
      setProfile(updated);
      refreshUser();
    } catch (err) {
      setError("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [connectionState, setConnectionState] = useState<
    "none" | "pending_sent" | "pending_received" | "connected"
  >("none");
  const [requestId, setRequestId] = useState<string | null>(null);

  const fetchConnectionStatus = async (profileId: string) => {
    try {
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        apiFetch("/friends"),
        apiFetch("/friends/requests/pending"),
        apiFetch("/friends/requests/sent"),
      ]);

      const [friends, pending, sent] = await Promise.all([
        friendsRes.json(),
        pendingRes.json(),
        sentRes.json(),
      ]);

      const friendsList = friends.data || friends;
      const pendingRequests = pending.data || pending;
      const sentRequests = sent.data || sent;

      if (friendsList.some((f: any) => f.user_id === profileId)) {
        setConnectionState("connected");
      } else {
        const sentReq = sentRequests.find(
          (r: any) => r.receiverId === profileId,
        );
        if (sentReq) {
          setConnectionState("pending_sent");
          setRequestId(sentReq.id);
        } else {
          const receivedReq = pendingRequests.find(
            (r: any) => r.senderId === profileId,
          );
          if (receivedReq) {
            setConnectionState("pending_received");
            setRequestId(receivedReq.id);
          } else {
            setConnectionState("none");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch connection status", err);
    }
  };

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = isSelf
          ? "/users/me"
          : `/users/profile/${encodeURIComponent(username)}`;

        const response = await apiFetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        const match = data.data || data;

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

        if (!isSelf && match.user_id) {
          fetchConnectionStatus(match.user_id);
        }
      } catch (err) {
        setError("Profile not found");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, isSelf]);

  const handleAction = async (
    action: "connect" | "accept" | "cancel" | "reject",
  ) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      let res;
      if (action === "connect") {
        res = await apiFetch("/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: profile.user_id }),
        });
      } else if (action === "accept") {
        res = await apiFetch(`/friends/request/${requestId}/accept`, {
          method: "POST",
        });
      } else if (action === "cancel") {
        res = await apiFetch(`/friends/request/${requestId}/cancel`, {
          method: "DELETE",
        });
      } else if (action === "reject") {
        res = await apiFetch(`/friends/request/${requestId}/reject`, {
          method: "POST",
        });
      }

      if (res?.ok) {
        await fetchConnectionStatus(profile.user_id);
      }
    } catch (err) {
      console.error(`Failed to ${action}`, err);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="px-6 pb-16 min-h-screen">
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
                    onlineUsers.includes(profile?.user_id || "") ||
                    (isSelf && onlineUsers.includes(user?.user_id || ""))
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {onlineUsers.includes(profile?.user_id || "") ||
                  (isSelf && onlineUsers.includes(user?.user_id || ""))
                    ? "Active"
                    : "Offline"}
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
                  <div className="relative group">
                    <div className="relative w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-semibold overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all">
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

                      {isSelf && (
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${
                            isUploadingAvatar
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                        >
                          {isUploadingAvatar ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {isSelf && (
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                    )}

                    {(onlineUsers.includes(profile?.user_id || "") ||
                      (isSelf &&
                        onlineUsers.includes(user?.user_id || ""))) && (
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
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {connectionState === "connected" ? (
                        <>
                          <Link href="/chat" className="w-full">
                            <Button className="w-full">Send Message</Button>
                          </Link>
                          <span className="text-center text-xs font-semibold text-green-600 bg-green-50 py-2 rounded-xl border border-green-100">
                            ✓ Connected
                          </span>
                        </>
                      ) : connectionState === "pending_sent" ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleAction("cancel")}
                          >
                            Cancel Request
                          </Button>
                          <span className="text-center text-xs font-semibold text-orange-500 py-1">
                            Awaiting response
                          </span>
                        </>
                      ) : connectionState === "pending_received" ? (
                        <>
                          <Button
                            className="w-full"
                            onClick={() => handleAction("accept")}
                          >
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => handleAction("reject")}
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleAction("connect")}
                        >
                          Add Connection
                        </Button>
                      )}
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
                    {isSelf ? profile?.email || "Not set" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone</span>
                  <span className="font-medium text-[#1F2329]">
                    {isSelf
                      ? profile?.phone || "Not set"
                      : profile?.phone || "Not shared"}
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
                    {onlineUsers.includes(profile?.user_id || "") ||
                    (isSelf && onlineUsers.includes(user?.user_id || ""))
                      ? "Active"
                      : "Offline"}
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
