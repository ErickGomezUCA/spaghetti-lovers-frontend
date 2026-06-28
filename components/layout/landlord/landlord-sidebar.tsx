"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import {
  Home,
  Building2,
  Calendar,
  FileText,
  Wrench,
  Star,
  BarChart3,
  Bell,
  User,
  LogOut,
  Key,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

const landlordSections = [
  {
    title: "Principal",
    items: [{ href: "/propietario", label: "Inicio", icon: Home }],
  },
  {
    title: "Gestión",
    items: [
      {
        href: "/propietario/propiedades",
        label: "Mis Propiedades",
        icon: Building2,
      },
      { href: "/propietario/calendario", label: "Calendario", icon: Calendar },
      { href: "/propietario/reservas", label: "Reservas", icon: FileText },
      { href: "/propietario/contratos", label: "Contratos", icon: FileText },
      {
        href: "/propietario/mantenimiento",
        label: "Mantenimiento",
        icon: Wrench,
      },
      {
        href: "/propietario/codigos-acceso",
        label: "Códigos de Acceso",
        icon: Key,
      },
      { href: "/propietario/multas", label: "Multas", icon: DollarSign },
      {
        href: "/propietario/calificaciones",
        label: "Calificaciones",
        icon: Star,
      },
      { href: "/propietario/reportes", label: "Reportes", icon: BarChart3 },
      {
        href: "/propietario/notificaciones",
        label: "Notificaciones",
        icon: Bell,
      },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      { href: "/propietario/perfil", label: "Mi Perfil", icon: User },
    ],
  },
];

export function LandlordSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background">
          <Home className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-semibold italic text-foreground">
            RentFlow
          </span>
          <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            Hogares de Autor
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {landlordSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === "/propietario"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
