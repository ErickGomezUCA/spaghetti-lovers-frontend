"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react"

// Mock data
const verifications = [
  {
    id: "VER-001",
    userId: "USR-003",
    userName: "Carlos Mendoza",
    userEmail: "carlos.mendoza@email.com",
    userRole: "Landlord",
    documentUrl: "/documents/dui-carlos.pdf",
    status: "pending",
    submittedAt: "2024-06-18T10:30:00",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  },
  {
    id: "VER-002",
    userId: "USR-006",
    userName: "Laura Sánchez",
    userEmail: "laura.sanchez@email.com",
    userRole: "Tenant",
    documentUrl: "/documents/dui-laura.pdf",
    status: "pending",
    submittedAt: "2024-06-17T15:45:00",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  },
  {
    id: "VER-003",
    userId: "USR-007",
    userName: "Pedro Hernández",
    userEmail: "pedro.hernandez@email.com",
    userRole: "Landlord",
    documentUrl: "/documents/dui-pedro.pdf",
    status: "pending",
    submittedAt: "2024-06-16T09:00:00",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  },
  {
    id: "VER-004",
    userId: "USR-001",
    userName: "Juan Carlos Rodríguez",
    userEmail: "juan.rodriguez@email.com",
    userRole: "Landlord",
    documentUrl: "/documents/dui-juan.pdf",
    status: "verified",
    submittedAt: "2023-06-15T14:00:00",
    reviewedBy: "Admin Pedro",
    reviewedAt: "2023-06-16T10:00:00",
    rejectionReason: null,
  },
  {
    id: "VER-005",
    userId: "USR-004",
    userName: "Ana Martínez",
    userEmail: "ana.martinez@email.com",
    userRole: "Tenant",
    documentUrl: "/documents/dui-ana.pdf",
    status: "rejected",
    submittedAt: "2024-02-15T11:30:00",
    reviewedBy: "Admin Pedro",
    reviewedAt: "2024-02-16T09:00:00",
    rejectionReason: "Documento ilegible. Por favor, suba una imagen más clara.",
  },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  verified: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  verified: "Verificado",
  rejected: "Rechazado",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  verified: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
}

export default function VerificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVerification, setSelectedVerification] = useState<typeof verifications[0] | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = verifications.filter((v) => v.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Verificaciones de Identidad</h1>
          <p className="text-muted-foreground">Revisa y aprueba documentos de verificación</p>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {pendingCount} verificación{pendingCount > 1 ? "es" : ""} pendiente{pendingCount > 1 ? "s" : ""} de revisión
                </p>
                <p className="text-sm text-yellow-600">
                  Revisa los documentos lo antes posible para que los usuarios puedan operar en la plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-green-600">
              {verifications.filter((v) => v.status === "verified").length}
            </p>
            <p className="text-sm text-muted-foreground">Verificados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-red-600">
              {verifications.filter((v) => v.status === "rejected").length}
            </p>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <FileCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-blue-600">{verifications.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
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
                placeholder="Buscar por nombre, email o ID..."
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
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha Envío</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Revisado por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">{verification.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{verification.userName}</p>
                        <p className="text-xs text-muted-foreground">{verification.userEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {verification.userRole === "Landlord" ? "Propietario" : "Inquilino"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[verification.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[verification.status]}
                        {statusLabels[verification.status]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {verification.reviewedBy ? (
                      <div className="text-sm">
                        <p>{verification.reviewedBy}</p>
                        <p className="text-xs text-muted-foreground">
                          {verification.reviewedAt ? new Date(verification.reviewedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog open={isReviewDialogOpen && selectedVerification?.id === verification.id} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedVerification(verification)
                              setIsReviewDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Revisar Verificación {verification.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Usuario</p>
                                <p className="font-medium">{verification.userName}</p>
                                <p className="text-sm text-muted-foreground">{verification.userEmail}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Rol</p>
                                <p className="font-medium">
                                  {verification.userRole === "Landlord" ? "Propietario" : "Inquilino"}
                                </p>
                              </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/50">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold">Documento de Identidad</h4>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Descargar
                                </Button>
                              </div>
                              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FileCheck className="w-16 h-16 text-gray-400" />
                              </div>
                            </div>

                            {verification.status === "pending" && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                                    Motivo de rechazo (si aplica)
                                  </Label>
                                  <Textarea
                                    placeholder="Ingresa el motivo si vas a rechazar el documento..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="bg-input"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprobar
                                  </Button>
                                  <Button variant="destructive" className="flex-1">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rechazar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {verification.status === "rejected" && verification.rejectionReason && (
                              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                <p className="font-medium text-red-800 mb-1">Motivo de rechazo:</p>
                                <p className="text-sm text-red-700">{verification.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {verification.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
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
