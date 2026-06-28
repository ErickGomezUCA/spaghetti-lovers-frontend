"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notificationService } from "@/lib/services/notification.service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Bell,
  Home,
  UserCheck,
  Clock,
} from "lucide-react"

// Mock data
const stats = [
  { label: "Usuarios Totales", value: "156", icon: Users, color: "primary" },
  { label: "Propiedades Activas", value: "89", icon: Building2, color: "green" },
  { label: "Reservas del Mes", value: "34", icon: Calendar, color: "blue" },
  { label: "Ingresos del Mes", value: "$45,230", icon: DollarSign, color: "orange" },
]

const pendingVerifications = [
  { id: "VER-001", user: "Carlos Mendoza", type: "Propietario", submittedAt: "2024-06-18" },
  { id: "VER-002", user: "Laura Sánchez", type: "Inquilino", submittedAt: "2024-06-17" },
  { id: "VER-003", user: "Pedro Hernández", type: "Propietario", submittedAt: "2024-06-16" },
]

const criticalMaintenance = [
  { id: "MNT-001", property: "Apartamento Centro", issue: "Fuga de gas", reportedAt: "Hace 2 horas" },
  { id: "MNT-002", property: "Casa Playa", issue: "Sin electricidad", reportedAt: "Hace 5 horas" },
]

const recentActivity = [
  { type: "reservation", message: "Nueva reserva RES-045 creada", time: "Hace 30 min" },
  { type: "user", message: "Nuevo usuario registrado: Ana García", time: "Hace 1 hora" },
  { type: "property", message: "Propiedad PRO-089 publicada", time: "Hace 2 horas" },
  { type: "payment", message: "Pago de $1,200 confirmado", time: "Hace 3 horas" },
  { type: "verification", message: "Verificación VER-010 aprobada", time: "Hace 4 horas" },
]

const quickActions = [
  { label: "Verificar Usuario", icon: UserCheck, href: "/admin/verificaciones" },
  { label: "Ver Propiedades", icon: Building2, href: "/admin/propiedades" },
  { label: "Ver Reportes", icon: DollarSign, href: "/admin/reportes" },
  { label: "Mantenimientos", icon: Wrench, href: "/admin/mantenimiento" },
]

const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", iconBg: "bg-primary/10" },
  green: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" },
}

export default function AdminDashboard() {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

    const fetchUnreadNotificationsCount = async () => {
        try {
            const response = await notificationService.getUnreadCount()
            setUnreadNotificationsCount(response.data || 0)
        } catch (error) {
            console.error("Error cargando contador de notificaciones admin:", error)
        }
    }

    useEffect(() => {
        fetchUnreadNotificationsCount()

        const handleNotificationsUpdated = () => {
            fetchUnreadNotificationsCount()
        }

        window.addEventListener("notifications-updated", handleNotificationsUpdated)

        return () => {
            window.removeEventListener(
                "notifications-updated",
                handleNotificationsUpdated,
            )
        }
    }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-6 px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Bienvenido, Administrador</h1>
              <p className="text-muted-foreground mt-1">Aquí tienes un resumen del sistema RentFlow</p>
            </div>
            <Link href="/admin/notificaciones">
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-5 h-5" />

                    {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        {unreadNotificationsCount}
      </span>
                    )}
                </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color].iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${colorClasses[stat.color].text}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <Card className="border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Verificaciones Pendientes</CardTitle>
              <Link href="/admin/verificaciones">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingVerifications.map((verification) => (
              <div key={verification.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="p-2.5 bg-yellow-100 rounded-xl">
                  <FileCheck className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{verification.user}</p>
                  <p className="text-sm text-muted-foreground">{verification.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">{verification.submittedAt}</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 h-8">
                    Revisar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Maintenance */}
        <Card className="border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Mantenimiento Crítico</CardTitle>
              <Link href="/admin/mantenimiento">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {criticalMaintenance.length > 0 ? (
              <div className="space-y-3">
                {criticalMaintenance.map((maintenance) => (
                  <div key={maintenance.id} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium text-foreground">{maintenance.property}</span>
                    </div>
                    <p className="text-sm text-red-700 ml-11">{maintenance.issue}</p>
                    <div className="flex items-center gap-1 mt-2 ml-11">
                      <Clock className="w-3 h-3 text-red-500" />
                      <p className="text-xs text-red-500">{maintenance.reportedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <Wrench className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">No hay mantenimientos críticos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer h-full">
                    <div className="p-2.5 bg-primary/10 rounded-xl mb-3">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "reservation" ? "bg-blue-500" :
                    activity.type === "user" ? "bg-green-500" :
                    activity.type === "property" ? "bg-purple-500" :
                    activity.type === "payment" ? "bg-orange-500" :
                    "bg-yellow-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Resumen del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl font-semibold text-blue-600">89</p>
                <p className="text-sm text-muted-foreground mt-1">Propietarios</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-2xl font-semibold text-green-600">67</p>
                <p className="text-sm text-muted-foreground mt-1">Inquilinos</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-2xl font-semibold text-purple-600">78%</p>
                <p className="text-sm text-muted-foreground mt-1">Tasa Ocupación</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl text-center">
                <p className="text-2xl font-semibold text-orange-600">$12.5K</p>
                <p className="text-sm text-muted-foreground mt-1">Comisiones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
