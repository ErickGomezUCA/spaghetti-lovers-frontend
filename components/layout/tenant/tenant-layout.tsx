"use client";

import { useState } from "react";
import { TenantHeader } from "./tenant-header";
import { TenantSidebar } from "./tenant-sidebar";
import { cn } from "@/utils/cn";

interface TenantLayoutProps {
  children: React.ReactNode;
}

export function TenantLayout({ children }: TenantLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <TenantSidebar className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto" />

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <TenantSidebar
              className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl"
              onLinkClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
