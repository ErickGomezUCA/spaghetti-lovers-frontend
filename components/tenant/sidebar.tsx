'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'

const menuItems = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/tenant', icon: LayoutDashboard },
      { label: 'Buscar Propiedades', href: '/tenant/propiedades', icon: Search },
      { label: 'Mis Reservas', href: '/tenant/reservas', icon: CalendarDays },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Contratos', href: '/tenant/contratos', icon: FileText },
      { label: 'Mantenimiento', href: '/tenant/mantenimiento', icon: Wrench },
      { label: 'Códigos de Acceso', href: '/tenant/acceso', icon: Key },
    ],
  },
  {
    title: 'Mi Cuenta',
    items: [
      { label: 'Calificaciones', href: '/tenant/calificaciones', icon: Star },
      { label: 'Multas', href: '/tenant/multas', icon: AlertTriangle },
      { label: 'Documentos', href: '/tenant/documentos', icon: FileCheck },
      { label: 'Notificaciones', href: '/tenant/notificaciones', icon: Bell },
      { label: 'Mi Perfil', href: '/tenant/perfil', icon: User },
    ],
  },
]

interface SidebarProps {
  className?: string
  onLinkClick?: () => void
}

export function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex flex-col gap-6 p-4', className)}>
      {menuItems.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}
    </aside>
  )
}
