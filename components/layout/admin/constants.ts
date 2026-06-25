import {
  Home,
  Users,
  Building2,
  FileCheck,
  Calendar,
  Wrench,
  BarChart3,
  Bell,
  LogOut,
} from "lucide-react";

export const navSections = [
  {
    title: "PRINCIPAL",
    items: [{ href: "/admin", label: "Dashboard", icon: Home }],
  },
  {
    title: "SUPERVISIÓN",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", icon: Users },
      {
        href: "/admin/verificaciones",
        label: "Verificaciones",
        icon: FileCheck,
      },
      { href: "/admin/propiedades", label: "Propiedades", icon: Building2 },
      { href: "/admin/reservas", label: "Reservas", icon: Calendar },
      { href: "/admin/mantenimiento", label: "Mantenimiento", icon: Wrench },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
      { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
    ],
  },
];
