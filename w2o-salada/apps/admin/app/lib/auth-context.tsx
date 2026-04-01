"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "w2o_admin_session";

const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin1234",
  user: {
    id: "admin-001",
    email: "admin@w2o.kr",
    name: "관리자",
    role: "ADMIN" as const,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Redirect to login when not authenticated (except on /login page)
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      // localStorage도 한번 더 확인 (state 동기화 지연 대비)
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) {
        router.replace("/login");
      }
    }
  }, [isLoading, user, pathname, router]);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      // Demo credential check
      if (
        username === DEMO_CREDENTIALS.username &&
        password === DEMO_CREDENTIALS.password
      ) {
        const adminUser = DEMO_CREDENTIALS.user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        setUser(adminUser);
        // state 반영 후 이동하도록 약간 지연
        setTimeout(() => router.replace("/dashboard"), 100);
        return true;
      }
      return false;
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
