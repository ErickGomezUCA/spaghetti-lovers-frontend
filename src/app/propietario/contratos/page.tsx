"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FileText,
  Download,
  Eye,
  PenTool,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

// Mock data
const contracts = [
  {
    id: "CTR-001",
    reservationId: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    checkIn: "2024-06-15",
    checkOut: "2024-06-20",
    totalPrice: 575,
    status: "signed",
    contentUrl: "/contracts/ctr-001.pdf",
    createdAt: "2024-06-10T10:00:00",
    expiresAt: "2024-06-12T10:00:00",
    tenantSignedAt: "2024-06-10T14:30:00",
    landlordSignedAt: "2024-06-10T16:45:00",
  },
  {
    id: "CTR-002",
    reservationId: "RES-002",
    property: "Casa de Playa Costa del Sol",
    tenant: "Carlos López",
    checkIn: "2024-06-18",
    checkOut: "2024-06-25",
    totalPrice: 1325,
    status: "pending_signatures",
    contentUrl: "/contracts/ctr-002.pdf",
    createdAt: "2024-06-08T09:00:00",
    expiresAt: "2024-06-10T09:00:00",
    tenantSignedAt: "2024-06-08T11:20:00",
    landlordSignedAt: null,
  },
  {
    id: "CTR-003",
    reservationId: "RES-003",
    property: "Loft Moderno Zona Rosa",
    tenant: "Ana Martínez",
    checkIn: "2024-05-01",
    checkOut: "2024-05-30",
    totalPrice: 1816.5,
    status: "signed",
    contentUrl: "/contracts/ctr-003.pdf",
    createdAt: "2024-04-20T08:00:00",
    expiresAt: "2024-04-22T08:00:00",
    tenantSignedAt: "2024-04-20T10:00:00",
    landlordSignedAt: "2024-04-20T12:00:00",
  },
]

const statusColors: Record<string, string> = {
  pending_signatures: "bg-yellow-100 text-yellow-700 border-yellow-200",
  signed: "bg-green-100 text-green-700 border-green-200",
}

const statusLabels: Record<string, string> = {
  pending_signatures: "Pendiente de firma",
  signed: "Firmado",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending_signatures: <Clock className="w-4 h-4" />,
  signed: <CheckCircle className="w-4 h-4" />,
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null)

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tenant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingSignature = contracts.filter(
    (c) => c.status === "pending_signatures" && !c.landlordSignedAt
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gestiona los contratos digitales de tus reservas</p>
        </div>
      </div>

      {/* Pending signatures alert */}
      {pendingSignature.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Tienes {pendingSignature.length} contrato(s) pendiente(s) de tu firma
                </p>
                <p className="text-sm text-yellow-600">
                  Firma los contratos antes de que expiren para confirmar las reservas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending_signatures">Pendiente de firma</SelectItem>
                <SelectItem value="signed">Firmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Contrato</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Inquilino</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Firmas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{contract.property}</TableCell>
                  <TableCell>{contract.tenant}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{contract.checkIn}</p>
                      <p className="text-muted-foreground">→ {contract.checkOut}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${contract.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[contract.status]}
                        {statusLabels[contract.status]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${contract.tenantSignedAt ? "bg-green-500" : "bg-gray-300"}`}></span>
                        <span>Inquilino</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${contract.landlordSignedAt ? "bg-green-500" : "bg-gray-300"}`}></span>
                        <span>Propietario</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Contrato {contract.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Propiedad</p>
                                <p className="font-medium">{contract.property}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Inquilino</p>
                                <p className="font-medium">{contract.tenant}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Período</p>
                                <p className="font-medium">{contract.checkIn} - {contract.checkOut}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Monto Total</p>
                                <p className="font-medium">${contract.totalPrice.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Estado de Firmas</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${contract.tenantSignedAt ? "bg-green-100" : "bg-gray-100"}`}>
                                      {contract.tenantSignedAt ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">Firma del Inquilino</p>
                                      <p className="text-xs text-muted-foreground">
                                        {contract.tenantSignedAt
                                          ? `Firmado el ${new Date(contract.tenantSignedAt).toLocaleString()}`
                                          : "Pendiente"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${contract.landlordSignedAt ? "bg-green-100" : "bg-gray-100"}`}>
                                      {contract.landlordSignedAt ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">Firma del Propietario</p>
                                      <p className="text-xs text-muted-foreground">
                                        {contract.landlordSignedAt
                                          ? `Firmado el ${new Date(contract.landlordSignedAt).toLocaleString()}`
                                          : "Pendiente"}
                                      </p>
                                    </div>
                                  </div>
                                  {!contract.landlordSignedAt && (
                                    <Button className="bg-primary">
                                      <PenTool className="w-4 h-4 mr-2" />
                                      Firmar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <FileText className="w-4 h-4 mr-2" />
                                Ver Reserva
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {!contract.landlordSignedAt && contract.status === "pending_signatures" && (
                        <Button size="sm" className="bg-primary">
                          <PenTool className="w-4 h-4 mr-1" />
                          Firmar
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
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
