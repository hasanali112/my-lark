"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import Container from "@/components/layout/Container";

interface User {
  user_id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  status: "ONLINE" | "OFFLINE";
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  sender?: User;
  receiver?: User;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"find" | "requests" | "friends">(
    "find",
  );

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Requests State
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchPendingRequests();
      fetchSentRequests();
    } else if (activeTab === "friends") {
      fetchFriendsList();
    }
  }, [activeTab]);

  // Auth Header helper
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
    };
  };

  const getFetchOptions = (method: string = "GET", body?: any) => {
    return {
      method,
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      // If backend reads HttpOnly cookies:
      // credentials: "include" as RequestCredentials,
    };
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await apiFetch(
        `/users/search?q=${encodeURIComponent(searchQuery)}`,
        getFetchOptions(),
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || data); // Adjust based on your ResponseMessage wrapper
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const response = await apiFetch("/friends/request", {
        ...getFetchOptions("POST", { receiverId }),
      });
      if (response.ok) {
        alert("Friend request sent!");
        // Refresh or visually change button
      } else {
        const data = await response.json();
        alert(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await apiFetch(
        "/friends/requests/pending",
        getFetchOptions(),
      );
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.data || data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await apiFetch(
        "/friends/requests/sent",
        getFetchOptions(),
      );
      if (response.ok) {
        const data = await response.json();
        setSentRequests(data.data || data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFriendsList = async () => {
    try {
      const response = await apiFetch("/friends", getFetchOptions());
      if (response.ok) {
        const data = await response.json();
        setFriendsList(data.data || data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const response = await apiFetch(
        `/friends/request/${requestId}/accept`,
        getFetchOptions("POST"),
      );
      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
        alert("Request accepted!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const response = await apiFetch(
        `/friends/request/${requestId}/reject`,
        getFetchOptions("POST"),
      );
      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const response = await apiFetch(
        `/friends/request/${requestId}/cancel`,
        getFetchOptions("DELETE"),
      );
      if (response.ok) {
        setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="px-6 pb-16">
      <Container className="space-y-6">
        <header className="bg-white rounded-2xl border border-primary/15 shadow-sm px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9AA0AA] font-semibold">
                People
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#1F2329]">
                Connections & Profiles
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

        <div className="bg-white rounded-2xl border border-primary/15 shadow-sm px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("find")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                activeTab === "find"
                  ? "bg-primary text-white"
                  : "text-[#6B7280] hover:text-primary hover:bg-primary/10"
              }`}
            >
              Find
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                activeTab === "requests"
                  ? "bg-primary text-white"
                  : "text-[#6B7280] hover:text-primary hover:bg-primary/10"
              }`}
            >
              Requests{" "}
              {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                activeTab === "friends"
                  ? "bg-primary text-white"
                  : "text-[#6B7280] hover:text-primary hover:bg-primary/10"
              }`}
            >
              Connections
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-primary/15 shadow-sm p-6 min-h-[420px]">
          {activeTab === "find" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 md:flex-row md:items-center"
              >
                <div className="flex-1 relative">
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
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="md:min-w-[140px]"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>

              <div className="space-y-3">
                {searchResults.length === 0 && searchQuery && !isSearching ? (
                  <div className="text-center text-[#8A9099] py-10">
                    No profiles found. Try a different search.
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4 hover:border-primary/30"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {user.fullName?.[0] || user.username[0].toUpperCase()}
                          <span
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                              user.status === "ONLINE"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F2329] truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-[#6B7280] truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/community/profile/${user.username}`}
                          className="text-sm font-semibold text-primary hover:opacity-80"
                        >
                          View Profile
                        </Link>
                        <Button onClick={() => sendFriendRequest(user.user_id)}>
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-10">
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
                    pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {request.sender?.fullName?.[0] ||
                              request.sender?.username?.[0]?.toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1F2329]">
                              {request.sender?.fullName ||
                                request.sender?.username}
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              @{request.sender?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequest(request.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectRequest(request.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
                    sentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] font-semibold">
                            {request.receiver?.fullName?.[0] ||
                              request.receiver?.username?.[0]?.toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1F2329]">
                              {request.receiver?.fullName ||
                                request.receiver?.username}
                            </p>
                            <span className="text-xs text-[#F97316] font-semibold">
                              Pending
                            </span>
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelRequest(request.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-transparent text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="space-y-3">
              {friendsList.length === 0 ? (
                <p className="text-center text-[#8A9099] py-10">
                  You don&apos;t have any connections yet. Use the Find tab to
                  discover new people.
                </p>
              ) : (
                friendsList.map((friend) => (
                  <div
                    key={friend.user_id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FBFBFC] px-4 py-4 hover:border-primary/30"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                        {friend.fullName?.[0] ||
                          friend.username[0].toUpperCase()}
                        {friend.status === "ONLINE" && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2329] truncate">
                          {friend.fullName || friend.username}
                        </p>
                        <p className="text-sm text-[#6B7280] truncate">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/community/profile/${friend.username}`}
                        className="text-sm font-semibold text-primary hover:opacity-80"
                      >
                        View Profile
                      </Link>
                      <Button variant="outline" className="text-sm">
                        Message
                      </Button>
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
