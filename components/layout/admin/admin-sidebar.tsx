"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { Home, LogOut } from "lucide-react";
import { navSections } from "./constants";
import { useAuth } from "@/lib/contexts/auth-context";

export function AdminSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64">
      <aside className="flex flex-col w-64 h-screen bg-card border-r border-border fixed top-0 left-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background">
            <Home className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold italic text-foreground">
              RentFlow
            </span>
            <span className="text-xs font-medium tracking-wider text-primary uppercase">
              Panel Admin
            </span>
          </div>
        </div>
        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon
                          className={cn("w-5 h-5", isActive && "text-primary")}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
        {/* Bottom Section */}
        <div className="px-4 py-4 border-t border-border">
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </div>
  );
}
