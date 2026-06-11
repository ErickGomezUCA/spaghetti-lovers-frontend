"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  Wrench,
  Eye,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image,
  Calendar,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data
const maintenanceRequests = [
  {
    id: "MNT-001",
    property: "Apartamento Centro Histórico",
    reservationId: "RES-001",
    title: "Aire acondicionado no funciona",
    description: "El AC de la habitación principal no enciende",
    urgency: "high",
    status: "scheduled",
    reportedBy: "María García",
    reportedByRole: "tenant",
    requestPhotos: ["/placeholder.svg?text=AC1", "/placeholder.svg?text=AC2"],
    responsePhotos: [],
    createdAt: "2024-06-16",
    scheduledStart: null,
    scheduledEnd: null,
    resolutionNotes: null,
  },
  {
    id: "MNT-002",
    property: "Casa de Playa Costa del Sol",
    reservationId: null,
    title: "Reparación de cerca perimetral",
    description: "Una sección de la cerca fue dañada por el viento",
    urgency: "medium",
    status: "resolving",
    reportedBy: "Juan Propietario",
    reportedByRole: "landlord",
    requestPhotos: ["/placeholder.svg?text=Fence1"],
    responsePhotos: [],
    createdAt: "2024-06-14",
    scheduledStart: "2024-06-17",
    scheduledEnd: "2024-06-18",
    resolutionNotes: null,
  },
  {
    id: "MNT-003",
    property: "Loft Moderno Zona Rosa",
    reservationId: "RES-003",
    title: "Fuga en el baño",
    description: "Hay una pequeña fuga debajo del lavamanos",
    urgency: "critical",
    status: "resolved",
    reportedBy: "Ana Martínez",
    reportedByRole: "tenant",
    requestPhotos: ["/placeholder.svg?text=Leak1", "/placeholder.svg?text=Leak2"],
    responsePhotos: ["/placeholder.svg?text=Fixed1"],
    createdAt: "2024-05-15",
    scheduledStart: "2024-05-15",
    scheduledEnd: "2024-05-15",
    resolutionNotes: "Fuga reparada. Se reemplazó el sifón del lavamanos.",
  },
]

const urgencyColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
}

const urgencyLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  resolving: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
}

const statusLabels: Record<string, string> = {
  scheduled: "Programado",
  resolving: "En progreso",
  resolved: "Resuelto",
}

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <Clock className="w-4 h-4" />,
  resolving: <Wrench className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<typeof maintenanceRequests[0] | null>(null)

  const filteredRequests = maintenanceRequests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mantenimiento</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes de reparación y mantenimiento</p>
        </div>
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva Solicitud de Mantenimiento</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Propiedad</Label>
                <Select>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Selecciona una propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Apartamento Centro Histórico</SelectItem>
                    <SelectItem value="2">Casa de Playa Costa del Sol</SelectItem>
                    <SelectItem value="3">Loft Moderno Zona Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Título</Label>
                <Input placeholder="Describe brevemente el problema" className="bg-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Descripción</Label>
                <Textarea placeholder="Proporciona más detalles..." rows={3} className="bg-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Urgencia</Label>
                <Select>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Selecciona la urgencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Fotos (opcional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Arrastra fotos o haz clic para subir</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewRequestOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary">
                  Crear Solicitud
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {maintenanceRequests.filter((r) => r.status === "scheduled").length}
            </p>
            <p className="text-sm text-muted-foreground">Programados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {maintenanceRequests.filter((r) => r.status === "resolving").length}
            </p>
            <p className="text-sm text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {maintenanceRequests.filter((r) => r.status === "resolved").length}
            </p>
            <p className="text-sm text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">
              {maintenanceRequests.filter((r) => r.urgency === "critical" && r.status !== "resolved").length}
            </p>
            <p className="text-sm text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, propiedad o título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="resolving">En progreso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-40 bg-input">
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{request.property}</TableCell>
                  <TableCell>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {request.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge className={urgencyColors[request.urgency]}>
                      {request.urgency === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {urgencyLabels[request.urgency]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{request.reportedBy}</p>
                    <p className="text-xs text-muted-foreground capitalize">{request.reportedByRole === "tenant" ? "Inquilino" : "Propietario"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[request.status]}
                        {statusLabels[request.status]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{request.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Solicitud {request.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Propiedad</p>
                                <p className="font-medium">{request.property}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Urgencia</p>
                                <Badge className={urgencyColors[request.urgency]}>
                                  {urgencyLabels[request.urgency]}
                                </Badge>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Problema</p>
                                <p className="font-medium">{request.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                              </div>
                            </div>

                            {request.requestPhotos.length > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Fotos del problema</p>
                                <div className="flex gap-2">
                                  {request.requestPhotos.map((photo, i) => (
                                    <img key={i} src={photo} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {request.status === "scheduled" && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Programar Mantenimiento</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Fecha Inicio</Label>
                                    <Input type="datetime-local" className="bg-input" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Fecha Fin</Label>
                                    <Input type="datetime-local" className="bg-input" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                  <Checkbox id="blockCalendar" />
                                  <Label htmlFor="blockCalendar" className="text-sm">Bloquear calendario durante el mantenimiento</Label>
                                </div>
                                <Button className="w-full mt-4 bg-primary">
                                  <Play className="w-4 h-4 mr-2" />
                                  Iniciar Mantenimiento
                                </Button>
                              </div>
                            )}

                            {request.status === "resolving" && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Marcar como Resuelto</h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Notas de resolución</Label>
                                    <Textarea placeholder="Describe el trabajo realizado..." rows={3} className="bg-input" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Fotos de respuesta</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                      <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground mt-2">Sube fotos del trabajo completado</p>
                                    </div>
                                  </div>
                                  <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar como Resuelto
                                  </Button>
                                </div>
                              </div>
                            )}

                            {request.status === "resolved" && request.resolutionNotes && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Resolución</h4>
                                <p className="text-sm text-muted-foreground">{request.resolutionNotes}</p>
                                {request.responsePhotos.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-2">Fotos de resolución</p>
                                    <div className="flex gap-2">
                                      {request.responsePhotos.map((photo, i) => (
                                        <img key={i} src={photo} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {request.status === "scheduled" && (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {request.status === "resolving" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
