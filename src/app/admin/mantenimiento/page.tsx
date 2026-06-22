"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Filter,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { maintenanceService } from "@/lib/services/maintenance.service"
import { MaintenanceResponse, MaintenanceStatus, Urgency } from "@/types/api-responses"

const statusConfig: Record<
  MaintenanceStatus,
  { label: string; color: string; Icon: typeof CheckCircle }
> = {
  SCHEDULED: { label: "Programado", color: "bg-blue-100 text-blue-700", Icon: Clock },
  RESOLVING: { label: "En proceso", color: "bg-orange-100 text-orange-700", Icon: Wrench },
  RESOLVED: { label: "Resuelto", color: "bg-green-100 text-green-700", Icon: CheckCircle },
}

const urgencyConfig: Record<
  Urgency,
  { label: string; color: string; Icon: typeof AlertTriangle }
> = {
  LOW: { label: "Baja", color: "bg-gray-100 text-gray-700", Icon: Clock },
  MEDIUM: { label: "Media", color: "bg-yellow-100 text-yellow-700", Icon: AlertTriangle },
  HIGH: { label: "Alta", color: "bg-orange-100 text-orange-700", Icon: AlertTriangle },
  CRITICAL: { label: "Critica", color: "bg-red-100 text-red-700", Icon: AlertOctagon },
}

export default function AdminMaintenancePage() {
  const [maintenances, setMaintenances] = useState<MaintenanceResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all")
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "all">("all")
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceResponse | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    maintenanceService.getAll().then((res) => setMaintenances(res.data)).catch(() => {})
  }, [])

  const filteredMaintenances = maintenances.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || item.maintenanceStatus === statusFilter
    const matchesUrgency = urgencyFilter === "all" || item.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const stats = {
    total: maintenances.length,
    critical: maintenances.filter((m) => m.urgency === "CRITICAL").length,
    inProgress: maintenances.filter((m) => m.maintenanceStatus === "RESOLVING").length,
    pending: maintenances.filter((m) => m.maintenanceStatus === "SCHEDULED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mantenimiento del Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Supervision de solicitudes de mantenimiento criticas
        </p>
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
                placeholder="Buscar por titulo o descripcion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all"
                    ? "Estado"
                    : statusConfig[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("SCHEDULED")}>
                  Programados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("RESOLVING")}>
                  En proceso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("RESOLVED")}>
                  Resueltos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {urgencyFilter === "all"
                    ? "Urgencia"
                    : urgencyConfig[urgencyFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setUrgencyFilter("all")}>
                  Todas las urgencias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("CRITICAL")}>
                  Critica
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("HIGH")}>
                  Alta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("MEDIUM")}>
                  Media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUrgencyFilter("LOW")}>
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
          <CardTitle className="text-lg">
            Solicitudes de Mantenimiento ({filteredMaintenances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMaintenances.map((item) => {
              const status = statusConfig[item.maintenanceStatus]
              const urgency = urgencyConfig[item.urgency]
              const StatusIcon = status.Icon
              const UrgencyIcon = urgency.Icon
              return (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    item.urgency === "CRITICAL"
                      ? "border-red-300 bg-red-50/50"
                      : "border-border"
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          item.urgency === "CRITICAL" ? "bg-red-100" : "bg-primary/10"
                        }`}
                      >
                        <Wrench
                          className={`w-5 h-5 ${
                            item.urgency === "CRITICAL" ? "text-red-600" : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${urgency.color}`}
                    >
                      <UrgencyIcon className="w-3 h-3" />
                      {urgency.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMaintenance(item)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        {/* TODO: navigate to property page */}
                        {/* TODO: contact landlord */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {filteredMaintenances.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron solicitudes de mantenimiento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Mantenimiento</DialogTitle>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={urgencyConfig[selectedMaintenance.urgency].color}>
                  {urgencyConfig[selectedMaintenance.urgency].label}
                </Badge>
                <Badge className={statusConfig[selectedMaintenance.maintenanceStatus].color}>
                  {statusConfig[selectedMaintenance.maintenanceStatus].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-medium">{selectedMaintenance.title}</p>
              </div>
              {selectedMaintenance.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm">{selectedMaintenance.description}</p>
                </div>
              )}
              {selectedMaintenance.resolutionNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas de resolución</p>
                  <p className="text-sm">{selectedMaintenance.resolutionNotes}</p>
                </div>
              )}
              {selectedMaintenance.photoUrls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Fotos</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedMaintenance.photoUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
