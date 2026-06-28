"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Bell,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { notificationService } from "@/lib/services/notification.service"
import { reservationService } from "@/lib/services/reservation.service"
import { propertyService } from "@/lib/services/property.service"
import {
  ReservationResponse,
  LandlordReservationSummaryResponse,
  LandlordDashboardStats,
  NotificationResponse,
} from "@/types/api-responses"

const formatShortDate = (dateString: string) => {
  if (!dateString) return ""
  const [year, month, day] = dateString.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const monthName = date.toLocaleDateString("es-ES", { month: "short" })
  const cleanMonth = monthName.replace(".", "")
  const capitalizedMonth = cleanMonth.charAt(0).toUpperCase() + cleanMonth.slice(1)
  return `${day} ${capitalizedMonth}`
}

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "Hace un momento"
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
  if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

const displayTitle = (title: string) => {
  const translations: Record<string, string> = {
    "Reservation Cancelled": "Reserva cancelada",
    "New Reservation": "Nueva reserva recibida",
  }
  return translations[title] ?? title
}

const displayMessage = (message: string) => {
  const translations: Record<string, string> = {
    "The reservation has been cancelled.": "La reserva ha sido cancelada.",
    "You have a new reservation for your property.":
      "Tienes una nueva reserva para una de tus propiedades.",
  }
  return translations[message] ?? message
}

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { label: "Activa", className: "bg-green-600 hover:bg-green-700 text-white border-transparent" }
    case "CANCELLED":
      return { label: "Cancelada", className: "bg-red-600 hover:bg-red-700 text-white border-transparent" }
    case "COMPLETED":
      return { label: "Completada", className: "bg-gray-600 hover:bg-gray-700 text-white border-transparent" }
    case "RESERVED":
    default:
      return { label: "Reservada", className: "bg-secondary text-secondary-foreground hover:bg-secondary/80" }
  }
}

export default function LandlordDashboard() {
  const { user } = useAuth()

  const [summary, setSummary] = useState<LandlordReservationSummaryResponse | null>(null)
  const [recentReservations, setRecentReservations] = useState<ReservationResponse[]>([])
  const [recentNotifications, setRecentNotifications] = useState<NotificationResponse[]>([])
  const [landlordStats, setLandlordStats] = useState<LandlordDashboardStats | null>(null)
  const [propertiesCount, setPropertiesCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const [summaryRes, recentRes, notificationsRes, statsRes, propsRes] = await Promise.all([
          reservationService.getLandlordSummary(),
          reservationService.getLandlordReservations(0, 3),
          notificationService.getNotifications(false, 0, 3, "createdAt", "desc"),
          propertyService.getLandlordStats(),
          propertyService.getByLandlord(user.id, 0, 1),
        ])
        setSummary(summaryRes.data)
        setRecentReservations(recentRes.data)
        setRecentNotifications(notificationsRes.data || [])
        setLandlordStats(statsRes.data)
        setPropertiesCount(propsRes.pagination?.totalItems ?? null)
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    const handleNotificationsUpdated = () => {
      fetchDashboardData()
    }

    window.addEventListener("notifications-updated", handleNotificationsUpdated)

    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdated)
    }
  }, [user])

  const stats = [
    {
      label: "Propiedades",
      value: propertiesCount !== null ? propertiesCount.toString() : "—",
      icon: Building2,
      trend: "",
    },
    {
      label: "Reservas Activas",
      value: summary ? (summary.active + summary.reserved).toString() : "0",
      icon: Calendar,
      trend: summary ? `${summary.reserved} pendientes de check-in` : "0 pendientes",
    },
    {
      label: "Ingresos del Mes",
      value: landlordStats
        ? `$${landlordStats.monthlyIncome.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : "—",
      icon: DollarSign,
      trend: "",
    },
    {
      label: "Ocupación Promedio",
      value: landlordStats ? `${landlordStats.averageOccupation}%` : "—",
      icon: TrendingUp,
      trend: "",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Panel de Propietario</h1>
          <p className="text-muted-foreground">
            Bienvenido de nuevo, {user?.name?.split(" ")[0] || "Propietario"}
          </p>
        </div>
        <Link href="/propietario/propiedades/nueva">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-t-4 border-t-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reservations */}
        <Card className="lg:col-span-2 border-t-4 border-t-primary relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Reservas Recientes</CardTitle>
            <Link href="/propietario/reservas">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay reservas recientes.
                </p>
              )}
              {recentReservations.map((reservation) => {
                const statusConfig = getStatusBadgeConfig(reservation.reservationStatus)
                return (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{reservation.propertyName}</p>
                        <p className="text-xs text-muted-foreground">
                          <Users className="w-3 h-3 inline mr-1" />
                          {reservation.tenantName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {formatShortDate(reservation.checkInDate)} -{" "}
                        {formatShortDate(reservation.checkOutDate)}
                      </p>
                      <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Notificaciones</CardTitle>
            <Link href="/propietario/notificaciones">
              <Button variant="ghost" size="sm" className="text-primary">
                <Bell className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hay notificaciones recientes.
                </p>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg p-3 ${notification.isRead ? "bg-muted/50" : "bg-primary/5"}`}
                  >
                    <p className="line-clamp-2 text-sm font-medium">
                      {displayTitle(notification.title)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {displayMessage(notification.message)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
