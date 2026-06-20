import {
  LayoutDashboard,
  Search,
  CalendarDays,
  FileText,
  Wrench,
  Key,
  Star,
  AlertTriangle,
  FileCheck,
  Bell,
  User,
} from "lucide-react";

export const menuItems = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", href: "/tenant", icon: LayoutDashboard },
      {
        label: "Buscar Propiedades",
        href: "/tenant/propiedades",
        icon: Search,
      },
      { label: "Mis Reservas", href: "/tenant/reservas", icon: CalendarDays },
    ],
  },
  {
    title: "Gestión",
    items: [
      { label: "Contratos", href: "/tenant/contratos", icon: FileText },
      { label: "Mantenimiento", href: "/tenant/mantenimiento", icon: Wrench },
      { label: "Códigos de Acceso", href: "/tenant/acceso", icon: Key },
    ],
  },
  {
    title: "Mi Cuenta",
    items: [
      { label: "Calificaciones", href: "/tenant/calificaciones", icon: Star },
      { label: "Multas", href: "/tenant/multas", icon: AlertTriangle },
      { label: "Documentos", href: "/tenant/documentos", icon: FileCheck },
      { label: "Notificaciones", href: "/tenant/notificaciones", icon: Bell },
      { label: "Mi Perfil", href: "/tenant/perfil", icon: User },
    ],
  },
];
