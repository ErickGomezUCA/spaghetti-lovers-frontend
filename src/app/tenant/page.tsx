'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, Key, Wrench, Star, ArrowRight, Home, Clock } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import {
  mockReservations,
  mockContracts,
  mockMaintenanceRequests,
  mockNotifications
} from '@/lib/mock-data'

const statusColors = {
  reserved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  reserved: 'Reservada',
  active: 'Activa',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export default function TenantDashboard() {
  const { user } = useAuth()
  const activeReservations = mockReservations.filter(
    r => r.reservationStatus === 'active' || r.reservationStatus === 'reserved'
  )
  const pendingContracts = mockContracts.filter(c => c.contractStatus === 'pending_signatures')
  const activeMaintenanceRequests = mockMaintenanceRequests.filter(
    m => m.maintenanceStatus !== 'resolved'
  )
  const unreadNotifications = mockNotifications.filter(n => !n.read)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aquí tienes un resumen de tu actividad en RentFlow
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeReservations.length}</p>
              <p className="text-sm text-muted-foreground">Reservas Activas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingContracts.length}</p>
              <p className="text-sm text-muted-foreground">Contratos Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeMaintenanceRequests.length}</p>
              <p className="text-sm text-muted-foreground">Mantenimientos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-sm text-muted-foreground">Mi Calificación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximas Reservas</CardTitle>
            <Link href="/tenant/reservas">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeReservations.length === 0 ? (
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
              activeReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium">{reservation.property.title}</h4>
                      <Badge className={statusColors[reservation.reservationStatus]}>
                        {statusLabels[reservation.reservationStatus]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reservation.property.city}, {reservation.property.department}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(reservation.checkInDate).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short' 
                        })} - {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
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

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notificaciones Recientes</CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge variant="secondary">{unreadNotifications.length} nuevas</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {mockNotifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className={!notif.read ? '' : 'ml-4'}>
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              ))}
              <Link href="/tenant/notificaciones">
                <Button variant="ghost" className="w-full text-primary">
                  Ver todas las notificaciones
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
