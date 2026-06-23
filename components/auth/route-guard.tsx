"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserRole } from "@/types/api-responses";

const ROLE_HOME: Record<UserRole, string> = {
  TENANT: "/tenant",
  LANDLORD: "/propietario",
  ADMIN: "/admin",
};

interface RouteGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RouteGuard({ allowedRole, children }: RouteGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== allowedRole) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [isLoading, isAuthenticated, user, allowedRole, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
