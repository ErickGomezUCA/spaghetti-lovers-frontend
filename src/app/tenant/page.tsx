"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, Key, Wrench, Star, ArrowRight, Home, Clock, Loader2, DollarSign, Users, Bell } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { reservationService } from '@/lib/services/reservation.service'
import { ratingService } from '@/lib/services/rating.service'
import { ReservationResponse } from '@/types/api-responses'

const formatShortDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
  const cleanMonth = monthName.replace('.', '');
  const capitalizedMonth = cleanMonth.charAt(0).toUpperCase() + cleanMonth.slice(1);
  return `${day} ${capitalizedMonth}`;
};

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { label: "Activa", className: "bg-green-100 text-green-800 border-transparent" };
    case "CANCELLED":
      return { label: "Cancelada", className: "bg-red-100 text-red-800 border-transparent" };
    case "COMPLETED":
      return { label: "Completada", className: "bg-gray-100 text-gray-800 border-transparent" };
    case "RESERVED":
    default:
      return { label: "Reservada", className: "bg-blue-100 text-blue-800 border-transparent" };
  }
};

export default function TenantDashboard() {
  const { user } = useAuth()
  
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {

    const fetchDashboardData = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const [reservationsRes, ratingsRes] = await Promise.all([
          reservationService.getMyReservations(0, 10),
          ratingService.getByUser(user.id)
        ])
        setReservations(reservationsRes.data || [])
        setAverageRating(
          ratingsRes.data?.averageScore ?? 0
        )
        setTotalRatings(
          ratingsRes.data?.totalRatings ?? 0
        )
      }
      catch (error) {
        console.error(
          "Error cargando dashboard:",
          error
        )
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  const activeReservations = reservations.filter(
    r => r.reservationStatus === 'ACTIVE' || r.reservationStatus === 'RESERVED'
  )

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user?.name?.split(' ')[0] || "Inquilino"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aquí tienes un resumen de tu actividad en RentFlow
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Reservas Activas (Conectado) */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : activeReservations.length}
              </p>
              <p className="text-sm text-muted-foreground">Reservas Activas</p>
            </div>
          </CardContent>
        </Card>

        {/* Contratos Pendientes (Pendiente de conexión) */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Contratos (Pendiente de conexión)</p>
            </div>
          </CardContent>
        </Card>

        {/* Mantenimientos (Pendiente de conexión) */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Mantenimientos (Pendiente de conexión)</p>
            </div>
          </CardContent>
        </Card>

        {/* Calificación */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Star className="h-6 w-6 text-green-600 fill-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {isLoading
                    ? "—"
                    : averageRating.toFixed(1)}
                </p>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">
                {totalRatings > 0
                  ? `${totalRatings} calificaciones recibidas`
                  : "Sin calificaciones"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reservations */}
        <Card className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximas Reservas</CardTitle>
            <Link href="/tenant/reservas">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeReservations.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Home className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tienes reservas activas</p>
                <Link href="/tenant/propiedades">
                  <Button className="mt-3" size="sm">
                    Buscar Propiedades
                  </Button>
                </Link>
              </div>
            ) : (
              activeReservations.slice(0, 4).map((reservation) => {
                const statusConfig = getStatusBadgeConfig(reservation.reservationStatus);
                
                return (
                  <div
                    key={reservation.id}
                    className="flex items-start gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shrink-0">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium truncate">{reservation.propertyName}</h4>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {(reservation as any).propertyCity && (reservation as any).propertyDepartment 
                          ? `${(reservation as any).propertyCity}, ${(reservation as any).propertyDepartment}`
                          : "Ubicación no disponible"}
                      </p>

                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {formatShortDate(reservation.checkInDate)} - {formatShortDate(reservation.checkOutDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/tenant/propiedades">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <Home className="h-5 w-5 text-primary" />
                  <span className="text-xs">Buscar Propiedad</span>
                </Button>
              </Link>
              <Link href="/tenant/contratos">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-xs">Firmar Contrato</span>
                </Button>
              </Link>
              <Link href="/tenant/mantenimiento">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <Wrench className="h-5 w-5 text-primary" />
                  <span className="text-xs">Reportar Problema</span>
                </Button>
              </Link>
              <Link href="/tenant/acceso">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <Key className="h-5 w-5 text-primary" />
                  <span className="text-xs">Ver Código</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Notifications (Pendiente de conexión) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notificaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg bg-muted/20">
                <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Pendiente de conexión</p>
                <p className="text-xs text-muted-foreground">Las notificaciones aparecerán aquí</p>
              </div>
              <Button variant="ghost" className="w-full text-primary" disabled>
                Ver todas las notificaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}