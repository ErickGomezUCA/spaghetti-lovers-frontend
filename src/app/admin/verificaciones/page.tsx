"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Loader2
} from "lucide-react"

import { identityDocumentService } from "@/lib/services/identity-document.service"
import { DocumentStatus, IdentityDocumentResponse } from "@/types/api-responses"

const statusColors: Record<DocumentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  VERIFIED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<DocumentStatus, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
}

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  VERIFIED: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
}

export default function VerificationsPage() {
  const [documents, setDocuments] = useState<IdentityDocumentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  
  const [selectedDoc, setSelectedDoc] = useState<IdentityDocumentResponse | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await identityDocumentService.getAllDocuments(statusFilter)
      setDocuments(res.data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

const filteredDocs = documents
    .filter((doc) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        doc.userName?.toLowerCase().includes(term) ||
        doc.userEmail?.toLowerCase().includes(term) ||
        doc.id.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      
      return dateB - dateA;
    });

  const pendingCount = documents.filter((d) => d.documentStatus === "PENDING").length

  const handleReviewAction = async (documentId: string, newStatus: DocumentStatus) => {
    if (newStatus === "REJECTED" && !rejectionReason.trim()) {
      alert("Por favor ingresa un motivo de rechazo.");
      return;
    }

    setIsProcessing(true)
    try {
      await identityDocumentService.reviewDocument(documentId, newStatus, rejectionReason);
      setIsReviewDialogOpen(false)
      setRejectionReason("")
      setSelectedDoc(null)
      fetchDocuments()
    } catch (error) {
      console.error(`Error updating document to ${newStatus}:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

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
      {pendingCount > 0 && !isLoading && (
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
            <p className="text-2xl font-semibold text-yellow-600">
              {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-green-600">
              {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : documents.filter((v) => v.documentStatus === "VERIFIED").length}
            </p>
            <p className="text-sm text-muted-foreground">Verificados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-red-600">
              {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : documents.filter((v) => v.documentStatus === "REJECTED").length}
            </p>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <FileCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-blue-600">
              {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : documents.length}
            </p>
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
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="VERIFIED">Verificados</SelectItem>
                <SelectItem value="REJECTED">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha Envío</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Revisado por</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No se encontraron documentos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.id.split("-")[0].toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.userName || "Usuario Desconocido"}</p>
                            <p className="text-xs text-muted-foreground">{doc.userEmail || doc.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.userRole === "LANDLORD" || doc.userRole === "ROLE_LANDLORD" ? "Propietario" : 
                           doc.userRole === "TENANT" || doc.userRole === "ROLE_TENANT" ? "Inquilino" : "Usuario"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[doc.documentStatus]} border-none hover:${statusColors[doc.documentStatus]}`}>
                          <span className="flex items-center gap-1">
                            {statusIcons[doc.documentStatus]}
                            {statusLabels[doc.documentStatus]}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.reviewedBy ? (
                          <div className="text-sm">
                            <p>{doc.reviewedBy}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Dialog 
                            open={isReviewDialogOpen && selectedDoc?.id === doc.id} 
                            onOpenChange={(open) => {
                              setIsReviewDialogOpen(open);
                              if (!open) { setRejectionReason(""); setSelectedDoc(null); }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedDoc(doc)
                                  setIsReviewDialogOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Revisar Verificación de {doc.userName || "Usuario"}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Usuario</p>
                                    <p className="font-medium">{doc.userName}</p>
                                    <p className="text-sm text-muted-foreground">{doc.userEmail}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Estado Actual</p>
                                    <Badge className={`${statusColors[doc.documentStatus]} border-none mt-1`}>
                                      {statusLabels[doc.documentStatus]}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-muted/50">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold">Documento de Identidad</h4>
                                    <Button variant="outline" size="sm" onClick={() => window.open(doc.documentUrl, '_blank')}>
                                      <Download className="w-4 h-4 mr-2" />
                                      Ver original
                                    </Button>
                                  </div>
                                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                                    {doc.documentUrl ? (
                                      <img 
                                        src={doc.documentUrl} 
                                        alt="Documento de identidad" 
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <FileCheck className="w-16 h-16 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                {/* Controles de Aprobación/Rechazo (Solo si está pendiente) */}
                                {doc.documentStatus === "PENDING" && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs uppercase text-muted-foreground font-medium">
                                        Motivo de rechazo (obligatorio si se rechaza)
                                      </Label>
                                      <Textarea
                                        placeholder="Ingresa el motivo si el documento no es válido..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={2}
                                        className="bg-background"
                                        disabled={isProcessing}
                                      />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                      <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleReviewAction(doc.id, "VERIFIED")}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Aprobar Documento
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        className="flex-1"
                                        onClick={() => handleReviewAction(doc.id, "REJECTED")}
                                        disabled={isProcessing || !rejectionReason.trim()}
                                      >
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <XCircle className="w-4 h-4 mr-2" />}
                                        Rechazar
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Motivo de rechazo visible si ya fue rechazado */}
                                {doc.documentStatus === "REJECTED" && doc.rejectionReason && (
                                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <p className="font-medium text-red-800 mb-1">Motivo de rechazo:</p>
                                    <p className="text-sm text-red-700">{doc.rejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}