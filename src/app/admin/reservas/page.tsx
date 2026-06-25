"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Eye,
  Calendar,
  User,
  Building2,
  DollarSign,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type ReservationStatus = "reserved" | "active" | "completed" | "cancelled"

interface Reservation {
  id: string
  propertyTitle: string
  tenantName: string
  tenantEmail: string
  landlordName: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  totalPrice: number
  status: ReservationStatus
  createdAt: string
  guestsCount: number
}

const mockReservations: Reservation[] = [
  {
    id: "RES-001",
    propertyTitle: "Apartamento Vista al Mar",
    tenantName: "Juan Perez",
    tenantEmail: "juan@email.com",
    landlordName: "Carlos Mendez",
    checkInDate: "2024-02-15",
    checkOutDate: "2024-02-20",
    totalNights: 5,
    totalPrice: 475,
    status: "active",
    createdAt: "2024-02-01",
    guestsCount: 2,
  },
  {
    id: "RES-002",
    propertyTitle: "Casa de Playa Familiar",
    tenantName: "Maria Lopez",
    tenantEmail: "maria.l@email.com",
    landlordName: "Maria Rodriguez",
    checkInDate: "2024-02-25",
    checkOutDate: "2024-03-02",
    totalNights: 6,
    totalPrice: 950,
    status: "reserved",
    createdAt: "2024-02-10",
    guestsCount: 4,
  },
  {
    id: "RES-003",
    propertyTitle: "Loft Centro Historico",
    tenantName: "Pedro Sanchez",
    tenantEmail: "pedro@email.com",
    landlordName: "Roberto Flores",
    checkInDate: "2024-01-10",
    checkOutDate: "2024-01-15",
    totalNights: 5,
    totalPrice: 375,
    status: "completed",
    createdAt: "2024-01-05",
    guestsCount: 1,
  },
  {
    id: "RES-004",
    propertyTitle: "Villa con Piscina",
    tenantName: "Ana Garcia",
    tenantEmail: "ana.g@email.com",
    landlordName: "Ana Martinez",
    checkInDate: "2024-02-01",
    checkOutDate: "2024-02-05",
    totalNights: 4,
    totalPrice: 850,
    status: "cancelled",
    createdAt: "2024-01-20",
    guestsCount: 3,
  },
]

const statusConfig: Record<ReservationStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  reserved: { label: "Reservada", color: "bg-blue-100 text-blue-700", icon: Clock },
  active: { label: "Activa", color: "bg-green-100 text-green-700", icon: PlayCircle },
  completed: { label: "Completada", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
}

export default function AdminReservationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all")

  const filteredReservations = mockReservations.filter((reservation) => {
    const matchesSearch =
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockReservations.length,
    active: mockReservations.filter((r) => r.status === "active").length,
    reserved: mockReservations.filter((r) => r.status === "reserved").length,
    totalRevenue: mockReservations
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + r.totalPrice, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reservas del Sistema</h1>
        <p className="text-muted-foreground mt-1">Supervision de todas las reservas de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Curso</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.reserved}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, inquilino o propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "Todos los estados" : statusConfig[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("reserved")}>
                  Reservadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Activas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                  Canceladas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Reservas ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const status = statusConfig[reservation.status]
              const StatusIcon = status.icon
              return (
                <div
                  key={reservation.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{reservation.id}</h3>
                        <p className="text-sm text-muted-foreground">{reservation.propertyTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground ml-13">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {reservation.tenantName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {reservation.landlordName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {reservation.checkInDate} - {reservation.checkOutDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${reservation.totalPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="w-4 h-4 mr-2" />
                          Ver inquilino
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building2 className="w-4 h-4 mr-2" />
                          Ver propiedad
                        </DropdownMenuItem>
                        {(reservation.status === "reserved" || reservation.status === "active") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Cancelar reserva
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {filteredReservations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron reservas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
