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
  AlertTriangle,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  Volume2,
  Home,
  CreditCard,
} from "lucide-react"

// Mock data
const fines = [
  {
    id: "FIN-001",
    reservationId: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    tenantEmail: "maria@email.com",
    fineType: "noise_violation",
    description: "Quejas de vecinos por ruido excesivo después de las 10 PM",
    amount: 50,
    issuedAt: "2024-06-17",
    resolvedAt: null,
    paymentId: "PAY-010",
    paymentMethod: null,
  },
  {
    id: "FIN-002",
    reservationId: "RES-003",
    property: "Loft Moderno Zona Rosa",
    tenant: "Ana Martínez",
    tenantEmail: "ana@email.com",
    fineType: "late_checkout",
    description: "Checkout 3 horas después de la hora acordada",
    amount: 75,
    issuedAt: "2024-05-30",
    resolvedAt: "2024-06-01",
    paymentId: "PAY-011",
    paymentMethod: "card",
  },
  {
    id: "FIN-003",
    reservationId: "RES-002",
    property: "Casa de Playa Costa del Sol",
    tenant: "Carlos López",
    tenantEmail: "carlos@email.com",
    fineType: "property_damage",
    description: "Daño en mesa de vidrio del comedor",
    amount: 200,
    issuedAt: "2024-06-20",
    resolvedAt: null,
    paymentId: "PAY-012",
    paymentMethod: null,
  },
]

const fineTypeLabels: Record<string, string> = {
  property_damage: "Daño a propiedad",
  noise_violation: "Violación de ruido",
  late_checkout: "Checkout tardío",
  late_payment: "Pago tardío",
}

const fineTypeColors: Record<string, string> = {
  property_damage: "bg-red-100 text-red-700 border-red-200",
  noise_violation: "bg-orange-100 text-orange-700 border-orange-200",
  late_checkout: "bg-yellow-100 text-yellow-700 border-yellow-200",
  late_payment: "bg-purple-100 text-purple-700 border-purple-200",
}

const fineTypeIcons: Record<string, React.ReactNode> = {
  property_damage: <Home className="w-4 h-4" />,
  noise_violation: <Volume2 className="w-4 h-4" />,
  late_checkout: <Clock className="w-4 h-4" />,
  late_payment: <CreditCard className="w-4 h-4" />,
}

export default function FinesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isNewFineOpen, setIsNewFineOpen] = useState(false)

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.tenant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "pending" && !fine.resolvedAt) ||
      (statusFilter === "resolved" && fine.resolvedAt)
    const matchesType = typeFilter === "all" || fine.fineType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalPending = fines.filter((f) => !f.resolvedAt).reduce((sum, f) => sum + f.amount, 0)
  const totalResolved = fines.filter((f) => f.resolvedAt).reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Multas</h1>
          <p className="text-muted-foreground">Gestiona las multas emitidas a inquilinos</p>
        </div>
        <Dialog open={isNewFineOpen} onOpenChange={setIsNewFineOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Emitir Multa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Emitir Nueva Multa</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Reserva</Label>
                <Select>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Selecciona una reserva activa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RES-001">RES-001 - María García (Apartamento Centro)</SelectItem>
                    <SelectItem value="RES-002">RES-002 - Carlos López (Casa Playa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Tipo de Multa</Label>
                <Select>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property_damage">Daño a propiedad</SelectItem>
                    <SelectItem value="noise_violation">Violación de ruido</SelectItem>
                    <SelectItem value="late_checkout">Checkout tardío</SelectItem>
                    <SelectItem value="late_payment">Pago tardío</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Monto (USD)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0.00" className="bg-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Descripción</Label>
                <Textarea 
                  placeholder="Describe el motivo de la multa con detalle..." 
                  rows={3} 
                  className="bg-input" 
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Importante</p>
                    <p className="text-yellow-600">
                      El inquilino recibirá una notificación sobre esta multa y deberá pagarla.
                      Si el monto supera el depósito de garantía, se generará un pago pendiente.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewFineOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary">
                  Emitir Multa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{fines.length}</p>
            <p className="text-sm text-muted-foreground">Total multas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {fines.filter((f) => !f.resolvedAt).length}
            </p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">${totalPending.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">${totalResolved.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Cobradas</p>
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
                placeholder="Buscar por ID, propiedad o inquilino..."
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
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="resolved">Pagadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="property_damage">Daño a propiedad</SelectItem>
                <SelectItem value="noise_violation">Violación de ruido</SelectItem>
                <SelectItem value="late_checkout">Checkout tardío</SelectItem>
                <SelectItem value="late_payment">Pago tardío</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fines Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reserva</TableHead>
                <TableHead>Inquilino</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFines.map((fine) => (
                <TableRow key={fine.id}>
                  <TableCell className="font-medium">{fine.id}</TableCell>
                  <TableCell>{fine.reservationId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{fine.tenant}</p>
                      <p className="text-xs text-muted-foreground">{fine.tenantEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={fineTypeColors[fine.fineType]}>
                      <span className="flex items-center gap-1">
                        {fineTypeIcons[fine.fineType]}
                        {fineTypeLabels[fine.fineType]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{fine.description}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {fine.amount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>{fine.issuedAt}</TableCell>
                  <TableCell>
                    {fine.resolvedAt ? (
                      <Badge className="bg-green-100 text-green-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Pagada
                        </span>
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
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
