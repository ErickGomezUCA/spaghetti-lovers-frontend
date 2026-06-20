"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { AppUser, Auth, UserRole } from "@/types/api-responses";
import { authClient } from "../clients/auth-client";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (data: RegisterPayload) => Promise<AppUser>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get auth from localStorage on mount
  useEffect(() => {
    const savedAuth = authClient.getAuth();
    if (savedAuth) {
      setUser(savedAuth.user);
      setToken(savedAuth.token);
    }
    setIsLoading(false);
  }, []);

  const applyAuth = (auth: Auth) => {
    authClient.saveAuth(auth);
    setUser(auth.user);
    setToken(auth.token);
    return auth.user;
  };

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    return applyAuth(res.data);
  };

  const register = async (data: RegisterPayload) => {
    const res = await authService.register(data);
    return applyAuth(res.data);
  };

  const logout = () => {
    authClient.clearAuth();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const hasRole = (...roles: UserRole[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
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
