'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pen,
  Home,
  CalendarDays,
} from 'lucide-react'
import { contractService } from '@/lib/services/contract.service'
import { ContractDetailResponse } from '@/types/api-responses'
import { useAuth } from '@/lib/contexts/auth-context'

const statusColors = {
  PENDING_SIGNATURES: 'bg-amber-100 text-amber-800',
  SIGNED: 'bg-green-100 text-green-800',
}

const statusLabels = {
  PENDING_SIGNATURES: 'Pendiente de Firmas',
  SIGNED: 'Firmado',
}

function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(dateStr).toLocaleDateString('es-ES', options ?? { day: '2-digit', month: 'short' })
}

export default function ContractsPage() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<ContractDetailResponse[]>([])
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [selectedContract, setSelectedContract] = useState<ContractDetailResponse | null>(null)
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    contractService.getMyContracts().then((res) => setContracts(res.data)).catch(() => {})
  }, [])

  const pendingContracts = contracts.filter(
    (c) => c.contractStatus === 'PENDING_SIGNATURES' && c.tenantSignatureId === null
  )

  const canSign = (c: ContractDetailResponse) => {
    const notExpired = c.expiresAtTimestamp ? new Date(c.expiresAtTimestamp) > new Date() : false
    return c.contractStatus === 'PENDING_SIGNATURES' && c.tenantSignatureId === null && notExpired
  }

  const isExpired = (c: ContractDetailResponse) =>
    c.expiresAtTimestamp ? new Date(c.expiresAtTimestamp) < new Date() : false

  const handleSign = async () => {
    if (!selectedContract) return
    setIsSigning(true)
    try {
      const res = await contractService.sign(selectedContract.id)
      setContracts((prev) =>
        prev.map((c) => (c.id === selectedContract.id ? res.data : c))
      )
      setShowSignDialog(false)
    } catch {
      // TODO: show error toast
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Contratos</h1>
        <p className="text-muted-foreground">Revisa y firma tus contratos de alquiler</p>
      </div>

      {pendingContracts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Tienes {pendingContracts.length} contrato{pendingContracts.length > 1 ? 's' : ''} pendiente{pendingContracts.length > 1 ? 's' : ''} de firma
              </h3>
              <p className="text-sm text-amber-700">
                Recuerda firmar tus contratos antes de la fecha de vencimiento para confirmar tu reserva.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No tienes contratos</h3>
              <p className="text-muted-foreground">Los contratos de tus reservas aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id} className="overflow-hidden pl-4">
              <div className="flex flex-col md:flex-row">
                <div className="flex items-center justify-center bg-secondary p-6 md:w-48">
                  <FileText className="h-16 w-16 text-primary" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">Contrato de Alquiler</h3>
                      <p className="text-sm text-muted-foreground">{contract.propertyTitle}</p>
                    </div>
                    <Badge className={statusColors[contract.contractStatus]}>
                      {statusLabels[contract.contractStatus]}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Propiedad</p>
                        <p className="font-medium">{contract.propertyCity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="font-medium">
                          {formatDate(contract.checkInDate)} - {formatDate(contract.checkOutDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {contract.contractStatus === 'SIGNED' ? 'Firmado el' : 'Vence el'}
                        </p>
                        <p className={`font-medium ${isExpired(contract) && contract.contractStatus !== 'SIGNED' ? 'text-destructive' : ''}`}>
                          {contract.contractStatus === 'SIGNED'
                            ? formatDate(contract.createdAtTimestamp!, { day: 'numeric', month: 'short', year: 'numeric' })
                            : contract.expiresAtTimestamp
                              ? formatDate(contract.expiresAtTimestamp, { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Firmas</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {contract.tenantSignatureId ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="text-xs">Tú</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {contract.landlordSignatureId ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="text-xs">Propietario</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {contract.contentUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={contract.contentUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-1 h-4 w-4" /> Ver Contrato
                        </a>
                      </Button>
                    )}

                    {canSign(contract) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract)
                          setShowSignDialog(true)
                        }}
                      >
                        <Pen className="mr-1 h-4 w-4" /> Firmar
                      </Button>
                    )}

                    {isExpired(contract) && contract.contractStatus === 'PENDING_SIGNATURES' && (
                      <Badge variant="destructive">Expirado</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

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
                Al firmar este contrato, aceptas todos los términos y condiciones establecidos,
                incluyendo las reglas de la propiedad, política de cancelación y montos acordados.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Tu firma electrónica</p>
              <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-border py-8">
                <p className="font-serif text-2xl italic text-primary">{user?.name ?? 'Usuario'}</p>
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
              <Pen className="mr-1 h-4 w-4" />
              {isSigning ? 'Firmando...' : 'Confirmar Firma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
