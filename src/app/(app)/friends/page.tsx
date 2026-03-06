"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    // If using HttpOnly cookie, we might not have it here.
    // Usually backend will read from cookies directly. Let's send credentials.
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      const response = await fetch(
        `http://localhost:8000/api/v1/users/search?q=${encodeURIComponent(
          searchQuery,
        )}`,
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
      const response = await fetch(
        "http://localhost:8000/api/v1/friends/request",
        {
          ...getFetchOptions("POST", { receiverId }),
        },
      );
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
      const response = await fetch(
        "http://localhost:8000/api/v1/friends/requests/pending",
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
      const response = await fetch(
        "http://localhost:8000/api/v1/friends/requests/sent",
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
      const response = await fetch(
        "http://localhost:8000/api/v1/friends",
        getFetchOptions(),
      );
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
      const response = await fetch(
        `http://localhost:8000/api/v1/friends/request/${requestId}/accept`,
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
      const response = await fetch(
        `http://localhost:8000/api/v1/friends/request/${requestId}/reject`,
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
      const response = await fetch(
        `http://localhost:8000/api/v1/friends/request/${requestId}/cancel`,
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
    <div className="flex-1 overflow-y-auto bg-gradient-mesh p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-lg px-6 py-5">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-sky-300/20 blur-2xl animate-float" />
          <div className="absolute -left-12 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-200/40 to-transparent blur-2xl" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A8190]">
                People Directory
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold font-serif text-[#1F2329]">
                Find, connect, and build your circle
              </h1>
              <p className="text-sm text-[#646A73] mt-1">
                Discover profiles, manage requests, and stay close to your
                favorite teammates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#E8F0FF] text-[#2B59FF] text-xs font-semibold px-3 py-1">
                {friendsList.length} Connections
              </div>
              <div className="rounded-full bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold px-3 py-1">
                {pendingRequests.length} Pending
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-full bg-white/80 backdrop-blur border border-white/70 shadow-sm p-1 gap-1">
          <button
            onClick={() => setActiveTab("find")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
              activeTab === "find"
                ? "bg-[#1F2329] text-white shadow-md"
                : "text-[#646A73] hover:text-[#1F2329]"
            }`}
          >
            Find
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
              activeTab === "requests"
                ? "bg-[#1F2329] text-white shadow-md"
                : "text-[#646A73] hover:text-[#1F2329]"
            }`}
          >
            Requests{" "}
            {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
              activeTab === "friends"
                ? "bg-[#1F2329] text-white shadow-md"
                : "text-[#646A73] hover:text-[#1F2329]"
            }`}
          >
            Connections
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-white/70 p-6 min-h-[420px]">
          {/* Find Friends Tab */}
          {activeTab === "find" && (
            <div className="space-y-6">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  className="sm:min-w-[140px]"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.length === 0 && searchQuery && !isSearching ? (
                  <div className="col-span-full text-center text-[#8A9099] py-12">
                    No profiles found. Try a different search.
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="h-1 bg-gradient-to-r from-primary via-[#5B8CFF] to-[#9AD6FF]" />
                      <div className="p-5 flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl ring-4 ring-white">
                            {user.fullName?.[0] ||
                              user.username[0].toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${user.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1F2329] truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-[#6B7280] truncate">
                            @{user.username}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5">
                              Profile
                            </span>
                            <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[#3B5BDB]">
                              {user.status === "ONLINE" ? "Active" : "Offline"}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => sendFriendRequest(user.user_id)}
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
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
                <div className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="text-[#8A9099]">No pending requests.</p>
                  ) : (
                    pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-[#E5E7EB] rounded-2xl bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
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
                <div className="space-y-4">
                  {sentRequests.length === 0 ? (
                    <p className="text-[#8A9099]">No sent requests.</p>
                  ) : (
                    sentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-[#E5E7EB] rounded-2xl bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] font-bold">
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

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {friendsList.length === 0 ? (
                <p className="text-center text-[#8A9099] py-10">
                  You don&apos;t have any connections yet. Use the Find tab to
                  discover new people.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friendsList.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="group flex items-center gap-4 p-4 border border-[#E5E7EB] rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {friend.fullName?.[0] ||
                            friend.username[0].toUpperCase()}
                        </div>
                        {friend.status === "ONLINE" && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F2329] truncate">
                          {friend.fullName || friend.username}
                        </p>
                        <p className="text-sm text-[#6B7280] truncate">
                          @{friend.username}
                        </p>
                        <span className="mt-2 inline-flex text-xs font-semibold text-[#64748B] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                          {friend.status === "ONLINE" ? "Active now" : "Offline"}
                        </span>
                      </div>
                      <Button variant="outline" className="text-sm">
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
