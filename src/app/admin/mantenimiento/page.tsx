"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Eye,
  Wrench,
  Building2,
  User,
  Calendar,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MaintenanceStatus = "scheduled" | "resolving" | "resolved"
type UrgencyLevel = "low" | "medium" | "high" | "critical"

interface MaintenanceRequest {
  id: string
  title: string
  propertyTitle: string
  reportedBy: string
  reportedByRole: "Tenant" | "Landlord"
  landlordName: string
  urgency: UrgencyLevel
  status: MaintenanceStatus
  createdAt: string
  description: string
}

const mockMaintenance: MaintenanceRequest[] = [
  {
    id: "MNT-001",
    title: "Fuga de agua en bano principal",
    propertyTitle: "Apartamento Vista al Mar",
    reportedBy: "Juan Perez",
    reportedByRole: "Tenant",
    landlordName: "Carlos Mendez",
    urgency: "critical",
    status: "resolving",
    createdAt: "2024-02-14",
    description: "Hay una fuga considerable en la tuberia del lavamanos",
  },
  {
    id: "MNT-002",
    title: "Aire acondicionado no enfria",
    propertyTitle: "Casa de Playa Familiar",
    reportedBy: "Maria Lopez",
    reportedByRole: "Tenant",
    landlordName: "Maria Rodriguez",
    urgency: "high",
    status: "scheduled",
    createdAt: "2024-02-13",
    description: "El AC de la habitacion principal no esta enfriando correctamente",
  },
  {
    id: "MNT-003",
    title: "Puerta de entrada atascada",
    propertyTitle: "Loft Centro Historico",
    reportedBy: "Roberto Flores",
    reportedByRole: "Landlord",
    landlordName: "Roberto Flores",
    urgency: "medium",
    status: "resolved",
    createdAt: "2024-02-10",
    description: "La cerradura de la puerta principal necesita ajuste",
  },
  {
    id: "MNT-004",
    title: "Foco fundido en sala",
    propertyTitle: "Villa con Piscina",
    reportedBy: "Ana Garcia",
    reportedByRole: "Tenant",
    landlordName: "Ana Martinez",
    urgency: "low",
    status: "scheduled",
    createdAt: "2024-02-15",
    description: "Uno de los focos del candelabro de la sala esta fundido",
  },
]

const statusConfig: Record<MaintenanceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: "Programado", color: "bg-blue-100 text-blue-700", icon: Clock },
  resolving: { label: "En proceso", color: "bg-orange-100 text-orange-700", icon: Wrench },
  resolved: { label: "Resuelto", color: "bg-green-100 text-green-700", icon: CheckCircle },
}

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; icon: typeof AlertTriangle }> = {
  low: { label: "Baja", color: "bg-gray-100 text-gray-700", icon: Clock },
  medium: { label: "Media", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  critical: { label: "Critica", color: "bg-red-100 text-red-700", icon: AlertOctagon },
}

export default function AdminMaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all")
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | "all">("all")

  const filteredMaintenance = mockMaintenance.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || item.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const stats = {
    total: mockMaintenance.length,
    critical: mockMaintenance.filter((m) => m.urgency === "critical").length,
    inProgress: mockMaintenance.filter((m) => m.status === "resolving").length,
    pending: mockMaintenance.filter((m) => m.status === "scheduled").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mantenimiento del Sistema</h1>
        <p className="text-muted-foreground mt-1">Supervision de solicitudes de mantenimiento criticas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitudes</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Wrench className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Criticas</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
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
                placeholder="Buscar por ID, titulo o propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "Estado" : statusConfig[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  Programados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("resolving")}>
                  En proceso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
                  Resueltos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {urgencyFilter === "all" ? "Urgencia" : urgencyConfig[urgencyFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setUrgencyFilter("all")}>
                  Todas las urgencias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("critical")}>
                  Critica
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("high")}>
                  Alta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("medium")}>
                  Media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("low")}>
                  Baja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solicitudes de Mantenimiento ({filteredMaintenance.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMaintenance.map((item) => {
              const status = statusConfig[item.status]
              const urgency = urgencyConfig[item.urgency]
              const StatusIcon = status.icon
              const UrgencyIcon = urgency.icon
              return (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    item.urgency === "critical" ? "border-red-300 bg-red-50/50" : "border-border"
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        item.urgency === "critical" ? "bg-red-100" : "bg-primary/10"
                      }`}>
                        <Wrench className={`w-5 h-5 ${item.urgency === "critical" ? "text-red-600" : "text-primary"}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.id} - {item.propertyTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground ml-13">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {item.reportedBy} ({item.reportedByRole})
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {item.landlordName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${urgency.color}`}>
                      <UrgencyIcon className="w-3 h-3" />
                      {urgency.label}
                    </span>
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
                          <Building2 className="w-4 h-4 mr-2" />
                          Ver propiedad
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="w-4 h-4 mr-2" />
                          Contactar propietario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {filteredMaintenance.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron solicitudes de mantenimiento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
