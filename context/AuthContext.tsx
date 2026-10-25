"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string; // "ADMIN" | "MEISTARS" | "KASIERIS"
  storeBranch: string;
  hasQuickPin?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  authorizedUsers: AuthUser[];
  isLoading: boolean;
  login: (user: AuthUser) => void;
  switchUser: (targetUser: AuthUser) => void;
  logoutUser: (userId: string) => void;
  updateCurrentUser: (updatedUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_ACTIVE_KEY = "manilla_active_user";
const STORAGE_USERS_KEY = "manilla_authorized_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedActive = localStorage.getItem(STORAGE_ACTIVE_KEY);
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);

      let parsedActive: AuthUser | null = null;
      let parsedUsers: AuthUser[] = [];

      if (storedUsers) {
        parsedUsers = JSON.parse(storedUsers);
        setAuthorizedUsers(parsedUsers);
      }

      if (storedActive) {
        parsedActive = JSON.parse(storedActive);
        setCurrentUser(parsedActive);
      } else if (parsedUsers.length > 0) {
        // Ja aktīvais nav uzstādīts, bet ir autorizētie, ņemam pirmo
        parsedActive = parsedUsers[0];
        setCurrentUser(parsedActive);
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(parsedActive));
      }
    } catch (e) {
      console.error("Kļūda ielādējot lokālo sesiju:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Maršrutēšanas aizsardzība: ja lietotājs nav ielogojies un nav /login vai /contract lapā, novirzām uz /login
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute =
      pathname.startsWith("/login") || pathname.startsWith("/contract");

    if (!currentUser && !isPublicRoute) {
      router.push("/login");
    }
  }, [currentUser, isLoading, pathname, router]);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(user));

    setAuthorizedUsers((prev) => {
      const filtered = prev.filter(
        (u) => u.id !== user.id && u.email?.toLowerCase() !== user.email?.toLowerCase()
      );
      const updated = [...filtered, user];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });

    router.push("/");
  };

  const switchUser = (targetUser: AuthUser) => {
    setCurrentUser(targetUser);
    localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(targetUser));

    setAuthorizedUsers((prev) => {
      const filtered = prev.filter(
        (u) => u.id !== targetUser.id && u.email?.toLowerCase() !== targetUser.email?.toLowerCase()
      );
      const updated = [...filtered, targetUser];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const logoutUser = (userId: string) => {
    const updatedUsers = authorizedUsers.filter((u) => u.id !== userId);
    setAuthorizedUsers(updatedUsers);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

    if (currentUser?.id === userId) {
      if (updatedUsers.length > 0) {
        const nextUser = updatedUsers[0];
        setCurrentUser(nextUser);
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(nextUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_ACTIVE_KEY);
        router.push("/login");
      }
    }
  };

  const updateCurrentUser = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(updatedUser));

    setAuthorizedUsers((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authorizedUsers,
        isLoading,
        login,
        switchUser,
        logoutUser,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
