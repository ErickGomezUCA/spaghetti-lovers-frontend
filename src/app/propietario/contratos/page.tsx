"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
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
  DialogFooter,
  DialogDescription,
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
  Eye,
  PenTool,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { contractService } from "@/lib/services/contract.service"
import { ContractDetailResponse, ContractStatus } from "@/types/api-responses"
import { useAuth } from "@/lib/contexts/auth-context"

const statusColors: Record<ContractStatus, string> = {
  PENDING_SIGNATURES: "bg-yellow-100 text-yellow-700 border-yellow-200",
  SIGNED: "bg-green-100 text-green-700 border-green-200",
}

const statusLabels: Record<ContractStatus, string> = {
  PENDING_SIGNATURES: "Pendiente de firma",
  SIGNED: "Firmado",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function ContractsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [contracts, setContracts] = useState<ContractDetailResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedContract, setSelectedContract] = useState<ContractDetailResponse | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    contractService.getMyContracts().then((res) => setContracts(res.data)).catch(() => {})
  }, [])

  const canSign = (c: ContractDetailResponse) => {
    const notExpired = c.expiresAtTimestamp ? new Date(c.expiresAtTimestamp) > new Date() : false
    return c.contractStatus === "PENDING_SIGNATURES" && c.landlordSignatureId === null && notExpired
  }

  const pendingSignature = contracts.filter(canSign)

  const filteredContracts = contracts.filter((c) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      c.id.toLowerCase().includes(term) ||
      c.propertyTitle.toLowerCase().includes(term) ||
      c.tenantName.toLowerCase().includes(term)
    const matchesStatus = statusFilter === "all" || c.contractStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSign = async () => {
    if (!selectedContract) return
    setIsSigning(true)
    try {
      const res = await contractService.sign(selectedContract.id)
      setContracts((prev) =>
        prev.map((c) => (c.id === selectedContract.id ? res.data : c))
      )
      setShowSignDialog(false)
      setShowDetailDialog(false)
    } catch (err: unknown) {
      toast({
        title: "Error al firmar",
        description: err instanceof Error ? err.message : "No se pudo firmar el contrato.",
        variant: "destructive",
      })
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
        <p className="text-muted-foreground">Gestiona los contratos digitales de tus reservas</p>
      </div>

      {pendingSignature.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Tienes {pendingSignature.length} contrato{pendingSignature.length > 1 ? "s" : ""} pendiente{pendingSignature.length > 1 ? "s" : ""} de tu firma
                </p>
                <p className="text-sm text-yellow-600">
                  Firma los contratos antes de que expiren para confirmar las reservas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <SelectItem value="PENDING_SIGNATURES">Pendiente de firma</SelectItem>
                <SelectItem value="SIGNED">Firmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          {filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No hay contratos</h3>
              <p className="text-muted-foreground">Los contratos de tus reservas aparecerán aquí</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell className="max-w-[200px] truncate">
                      {contract.propertyTitle}
                    </TableCell>
                    <TableCell>{contract.tenantName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(contract.checkInDate)}</p>
                        <p className="text-muted-foreground">→ {formatDate(contract.checkOutDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(contract.totalPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[contract.contractStatus]}>
                        <span className="flex items-center gap-1">
                          {contract.contractStatus === "SIGNED" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {statusLabels[contract.contractStatus]}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${contract.tenantSignatureId ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>Inquilino</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${contract.landlordSignatureId ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>Propietario</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContract(contract)
                            setShowDetailDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canSign(contract) && (
                          <Button
                            size="sm"
                            className="bg-primary"
                            onClick={() => {
                              setSelectedContract(contract)
                              setShowSignDialog(true)
                            }}
                          >
                            <PenTool className="w-4 h-4 mr-1" />
                            Firmar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contrato {selectedContract?.id.slice(0, 8)}…</DialogTitle>
            <DialogDescription>{selectedContract?.propertyTitle}</DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Propiedad</p>
                  <p className="font-medium">{selectedContract.propertyTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inquilino</p>
                  <p className="font-medium">{selectedContract.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">
                    {formatDate(selectedContract.checkInDate)} - {formatDate(selectedContract.checkOutDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                  <p className="font-medium">${Number(selectedContract.totalPrice).toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Estado de Firmas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedContract.tenantSignatureId ? "bg-green-100" : "bg-gray-100"}`}>
                        {selectedContract.tenantSignatureId ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Firma del Inquilino</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedContract.tenantSignatureId ? "Firmado" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedContract.landlordSignatureId ? "bg-green-100" : "bg-gray-100"}`}>
                        {selectedContract.landlordSignatureId ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Firma del Propietario</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedContract.landlordSignatureId ? "Firmado" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                    {canSign(selectedContract) && (
                      <Button
                        className="bg-primary"
                        onClick={() => {
                          setShowDetailDialog(false)
                          setShowSignDialog(true)
                        }}
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Firmar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {selectedContract.contentUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={selectedContract.contentUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver PDF del Contrato
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign Confirmation Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar Contrato</DialogTitle>
            <DialogDescription>
              Confirma tu firma electrónica para el contrato de alquiler
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm">
                Al firmar este contrato, confirmas las condiciones de arrendamiento y aceptas
                los términos establecidos en el documento.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Tu firma electrónica</p>
              <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-border py-8">
                <p className="font-serif text-2xl italic text-primary">{user?.name ?? 'Propietario'}</p>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Firma generada con hash SHA-256 el {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
              <p className="text-xs text-amber-800">
                Esta firma tiene validez legal electrónica. Una vez firmado, el contrato no podrá
                modificarse sin el consentimiento de ambas partes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)} disabled={isSigning}>
              Cancelar
            </Button>
            <Button onClick={handleSign} disabled={isSigning}>
              <PenTool className="mr-1 h-4 w-4" />
              {isSigning ? 'Firmando...' : 'Confirmar Firma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
