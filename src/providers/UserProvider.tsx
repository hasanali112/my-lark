"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  user_id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  email: string;
  role: string | null;
  status: "ONLINE" | "OFFLINE";
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await apiFetch("/users/me", { skipRedirect: true });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data || data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
