"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import Container from "@/components/layout/Container";
import { useUser } from "@/providers/UserProvider";
import { useSocketContext } from "@/providers/SocketProvider";

interface UserItem {
  user_id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE";
  bio?: string | null;
  role?: string | null;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  sender?: UserItem;
  receiver?: UserItem;
}

type ConnectionState =
  | "none"
  | "connected"
  | "pending_sent"
  | "pending_received";

export default function FriendsPage() {
  const { user } = useUser();
  const { onlineUsers, socket } = useSocketContext();

  const [activeTab, setActiveTab] = useState<"find" | "requests" | "friends">(
    "find",
  );

  // Discover State
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Connection state map: userId -> ConnectionState
  const [connectionStates, setConnectionStates] = useState<
    Record<string, ConnectionState>
  >({});
  const [requestIdMap, setRequestIdMap] = useState<Record<string, string>>({}); // userId -> requestId

  // Requests State
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friendsList, setFriendsList] = useState<UserItem[]>([]);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {},
  );

  const setActionLoading = (userId: string, val: boolean) =>
    setLoadingActions((prev) => ({ ...prev, [userId]: val }));

  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, pendingRes, sentRes, friendsRes] = await Promise.all([
        apiFetch("/users/all"),
        apiFetch("/friends/requests/pending"),
        apiFetch("/friends/requests/sent"),
        apiFetch("/friends"),
      ]);

      const [usersData, pendingData, sentData, friendsData] = await Promise.all(
        [usersRes.json(), pendingRes.json(), sentRes.json(), friendsRes.json()],
      );

      const users: UserItem[] = usersData.data || usersData;
      const pending: FriendRequest[] = pendingData.data || pendingData;
      const sent: FriendRequest[] = sentData.data || sentData;
      const friends: UserItem[] = friendsData.data || friendsData;

      setAllUsers(users);
      setPendingRequests(pending);
      setSentRequests(sent);
      setFriendsList(friends);

      // Build connection state map
      const stateMap: Record<string, ConnectionState> = {};
      const idMap: Record<string, string> = {};

      friends.forEach((f) => {
        stateMap[f.user_id] = "connected";
      });
      sent.forEach((r) => {
        stateMap[r.receiverId] = "pending_sent";
        idMap[r.receiverId] = r.id;
      });
      pending.forEach((r) => {
        stateMap[r.senderId] = "pending_received";
        idMap[r.senderId] = r.id;
      });

      setConnectionStates(stateMap);
      setRequestIdMap(idMap);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-friend-request", (data) => {
      console.log("New friend request received:", data);
      fetchAllData();
    });

    socket.on("friend-request-accepted", (data) => {
      console.log("Friend request accepted:", data);
      fetchAllData();
    });

    socket.on("friend-request-canceled", (data) => {
      console.log("Friend request canceled:", data);
      fetchAllData();
    });

    socket.on("friend-request-rejected", (data) => {
      console.log("Friend request rejected:", data);
      fetchAllData();
    });

    return () => {
      socket.off("incoming-friend-request");
      socket.off("friend-request-accepted");
      socket.off("friend-request-canceled");
      socket.off("friend-request-rejected");
    };
  }, [socket, fetchAllData]);

  const sendRequest = async (receiverId: string) => {
    setActionLoading(receiverId, true);
    try {
      const res = await apiFetch("/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      const data = await res.json();
      if (res.ok) {
        const reqId = data.data?.id || data.id;
        setConnectionStates((prev) => ({
          ...prev,
          [receiverId]: "pending_sent",
        }));
        setRequestIdMap((prev) => ({ ...prev, [receiverId]: reqId }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(receiverId, false);
    }
  };

  const cancelRequest = async (userId: string) => {
    const reqId = requestIdMap[userId];
    if (!reqId) return;
    setActionLoading(userId, true);
    try {
      const res = await apiFetch(`/friends/request/${reqId}/cancel`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConnectionStates((prev) => ({ ...prev, [userId]: "none" }));
        setSentRequests((prev) => prev.filter((r) => r.id !== reqId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(userId, false);
    }
  };

  const acceptRequest = async (userId: string) => {
    const reqId = requestIdMap[userId];
    if (!reqId) return;
    setActionLoading(userId, true);
    try {
      const res = await apiFetch(`/friends/request/${reqId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        setConnectionStates((prev) => ({ ...prev, [userId]: "connected" }));
        setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(userId, false);
    }
  };

  const rejectRequest = async (reqId: string) => {
    try {
      const res = await apiFetch(`/friends/request/${reqId}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    // Hide if already connected or has pending request (sent or received)
    const state = connectionStates[u.user_id] || "none";
    if (state !== "none") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.fullName || "").toLowerCase().includes(q)
    );
  });

  const isOnline = (userId: string) => onlineUsers.includes(userId);

  const renderAvatar = (u: UserItem, size = 12) => {
    const sizeClass = `w-${size} h-${size}`;
    return (
      <div
        className={`relative ${sizeClass} rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg overflow-hidden shrink-0`}
      >
        {u.avatar ? (
          <Image
            src={u.avatar}
            alt={u.username}
            fill
            className="object-cover"
          />
        ) : (
          (u.fullName?.[0] || u.username[0]).toUpperCase()
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            isOnline(u.user_id) ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </div>
    );
  };

  const renderConnectionAction = (u: UserItem) => {
    const state = connectionStates[u.user_id] || "none";
    const loading = loadingActions[u.user_id];

    if (state === "connected") {
      return (
        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          ✓ Connected
        </span>
      );
    }
    if (state === "pending_sent") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => cancelRequest(u.user_id)}
          className="text-orange-500 border-orange-200 hover:bg-orange-50 text-xs"
        >
          {loading ? "..." : "Pending · Cancel"}
        </Button>
      );
    }
    if (state === "pending_received") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={loading}
            onClick={() => acceptRequest(u.user_id)}
          >
            {loading ? "..." : "Accept"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => rejectRequest(requestIdMap[u.user_id])}
          >
            Decline
          </Button>
        </div>
      );
    }
    return (
      <Button
        size="sm"
        disabled={loading}
        onClick={() => sendRequest(u.user_id)}
      >
        {loading ? "..." : "+ Connect"}
      </Button>
    );
  };

  return (
    <div className="px-6 pb-16 min-h-screen">
      <Container className="space-y-6">
        {/* Header */}
        <header className="bg-white rounded-2xl border border-primary/15 shadow-sm px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9AA0AA] font-semibold">
                People
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#1F2329]">
                Connections &amp; Profiles
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Discover teammates, review requests, and manage your network.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
                {friendsList.length} Connections
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
                {pendingRequests.length} Pending
              </div>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="bg-white rounded-2xl border border-primary/15 shadow-sm px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {(["find", "requests", "friends"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all capitalize ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-[#6B7280] hover:text-primary hover:bg-primary/10"
                }`}
              >
                {tab === "requests"
                  ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`
                  : tab === "friends"
                    ? "Connections"
                    : "Find People"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6 min-h-[420px]">
          {/* ── FIND TAB ── */}
          {activeTab === "find" && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0AA]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                />
              </div>

              {/* User List */}
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-20 text-[#9AA0AA]">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-3" />
                  Loading members...
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-[#8A9099] py-10">
                  {searchQuery ? "No users found." : "No other users yet."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.user_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-3 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderAvatar(u, 11)}
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F2329] truncate">
                            {u.fullName || u.username}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <span>@{u.username}</span>
                            {isOnline(u.user_id) && (
                              <span className="text-green-600 font-medium text-xs">
                                · Online
                              </span>
                            )}
                          </div>
                          {u.bio && (
                            <p className="text-xs text-[#9AA0AA] truncate mt-0.5">
                              {u.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/profile/${u.username}`}
                          className="text-xs font-semibold text-primary hover:opacity-70"
                        >
                          Profile
                        </Link>
                        {renderConnectionAction(u)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === "requests" && (
            <div className="space-y-10">
              {/* Incoming */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1F2329]">
                    Incoming Requests
                  </h3>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Review and respond
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingRequests.length === 0 ? (
                    <p className="text-[#8A9099]">No pending requests.</p>
                  ) : (
                    pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0 overflow-hidden">
                            {req.sender?.avatar ? (
                              <Image
                                src={req.sender.avatar}
                                alt={req.sender.username || ""}
                                width={44}
                                height={44}
                                className="object-cover"
                              />
                            ) : (
                              (
                                req.sender?.fullName?.[0] ||
                                req.sender?.username?.[0] ||
                                "?"
                              ).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1F2329]">
                              {req.sender?.fullName || req.sender?.username}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-[#6B7280]">
                                @{req.sender?.username}
                              </p>
                              <Link
                                href={`/profile/${req.sender?.username}`}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                View Profile
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequest(req.senderId)}
                            disabled={loadingActions[req.senderId]}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectRequest(req.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sent */}
              <div>
                <div className="flex items-center justify-between mb-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#1F2329]">
                    Sent Requests
                  </h3>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Awaiting response
                  </span>
                </div>
                <div className="space-y-3">
                  {sentRequests.length === 0 ? (
                    <p className="text-[#8A9099]">No sent requests.</p>
                  ) : (
                    sentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] font-semibold shrink-0 overflow-hidden">
                            {req.receiver?.avatar ? (
                              <Image
                                src={req.receiver.avatar}
                                alt={req.receiver.username || ""}
                                width={44}
                                height={44}
                                className="object-cover"
                              />
                            ) : (
                              (
                                req.receiver?.fullName?.[0] ||
                                req.receiver?.username?.[0] ||
                                "?"
                              ).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1F2329]">
                              {req.receiver?.fullName || req.receiver?.username}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-orange-500 font-semibold">
                                Pending response
                              </span>
                              <Link
                                href={`/profile/${req.receiver?.username}`}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                View Profile
                              </Link>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelRequest(req.receiverId)}
                          disabled={loadingActions[req.receiverId]}
                          className="text-red-500 hover:bg-red-50 border-transparent text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CONNECTIONS TAB ── */}
          {activeTab === "friends" && (
            <div className="space-y-3">
              {friendsList.length === 0 ? (
                <p className="text-center text-[#8A9099] py-10">
                  No connections yet. Use <strong>Find People</strong> to
                  connect with teammates.
                </p>
              ) : (
                friendsList.map((friend) => (
                  <div
                    key={friend.user_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {renderAvatar(friend, 11)}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2329] truncate">
                          {friend.fullName || friend.username}
                        </p>
                        <p className="text-sm text-[#6B7280] truncate">
                          @{friend.username}
                          {isOnline(friend.user_id) && (
                            <span className="text-green-600 font-medium ml-2">
                              · Online
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${friend.username}`}
                        className="text-sm font-semibold text-primary hover:opacity-80"
                      >
                        Profile
                      </Link>
                      <Link href={`/chat`}>
                        <Button variant="outline" className="text-sm" size="sm">
                          Message
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
