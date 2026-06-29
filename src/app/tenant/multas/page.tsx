'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle2, CreditCard, Home, CalendarDays, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { fineService } from '@/lib/services/fine.service'
import { FineSummaryResponse, FineType, PaginationMeta } from '@/types/api-responses'

const fineTypeLabels: Record<FineType, string> = {
  PROPERTY_DAMAGE: 'Daños a la propiedad',
  NOISE_VIOLATION: 'Violación de normas de ruido',
  LATE_CHECKOUT: 'Check-out tardío',
  LATE_PAYMENT: 'Pago tardío',
}

const fineTypeColors: Record<FineType, string> = {
  PROPERTY_DAMAGE: 'bg-red-100 text-red-800',
  NOISE_VIOLATION: 'bg-orange-100 text-orange-800',
  LATE_CHECKOUT: 'bg-amber-100 text-amber-800',
  LATE_PAYMENT: 'bg-blue-100 text-blue-800',
}

export default function FinesPage() {
  const [fines, setFines] = useState<FineSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<PaginationMeta | null>(null)
  const pageSize = 15

  const [showPayDialog, setShowPayDialog] = useState(false)
  const [selectedFine, setSelectedFine] = useState<FineSummaryResponse | null>(null)
  
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const fetchMyFines = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fineService.getMyFines(currentPage, pageSize)
      setFines(res.data || [])
      setPaginationInfo(res.pagination || null)
    } catch (error) {
      console.error('Error cargando tus multas:', error)
      setFetchError('No se pudieron cargar tus multas. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    fetchMyFines()
  }, [fetchMyFines])

  const totalPages = paginationInfo?.totalPages ?? 1
  const hasNext = paginationInfo?.hastNext ?? false

  const pendingFines = fines.filter((f) => !f.resolvedAt)
  const paidFines = fines.filter((f) => f.resolvedAt)
  const totalPending = pendingFines.reduce((sum, f) => sum + f.amount, 0)

  const openPayDialog = (fine: FineSummaryResponse) => {
    setSelectedFine(fine)
    setPayError(null)
    setShowPayDialog(true)
  }

  const handleConfirmPay = async () => {
    if (!selectedFine) return
    setIsPaying(true)
    setPayError(null)
    try {
      await fineService.payFine(selectedFine.fineId, paymentMethod)
      setShowPayDialog(false)
      fetchMyFines() 
    } catch (error: any) {
      console.error('Error pagando la multa:', error)
      setPayError(error?.message || 'No se pudo procesar el pago. Intenta de nuevo.')
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Multas</h1>
        <p className="text-muted-foreground">Gestiona las multas asociadas a tus reservas</p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4" />
          {fetchError}
        </div>
      )}

      {/* Summary Card */}
      {pendingFines.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">
                  Tienes {pendingFines.length} multa{pendingFines.length > 1 ? 's' : ''} pendiente{pendingFines.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total pendiente: <span className="font-bold text-destructive">${totalPending.toFixed(2)}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Las multas pendientes pueden afectar tu depósito de garantía y tu calificación como inquilino.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Fines State */}
      {fines.length === 0 && !fetchError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">¡Sin multas!</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No tienes ninguna multa registrada. Sigue respetando las normas de las propiedades
              para mantener tu buen historial.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Fines */}
      {pendingFines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Multas Pendientes</h2>
          {pendingFines.map((fine) => (
            <Card key={fine.fineId} className="border-destructive/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={fineTypeColors[fine.fineType]}>
                          {fineTypeLabels[fine.fineType]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm">{fine.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {fine.propertyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Emitida: {new Date(fine.issuedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-destructive">${fine.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Monto a pagar</p>
                    </div>
                    <Button onClick={() => openPayDialog(fine)}>
                      <CreditCard className="mr-1 h-4 w-4" /> Pagar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paid Fines */}
      {paidFines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Multas Pagadas</h2>
          {paidFines.map((fine) => (
            <Card key={fine.fineId} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <Badge variant="secondary">
                        {fineTypeLabels[fine.fineType]}
                      </Badge>
                      <p className="mt-1 text-sm text-muted-foreground">{fine.description}</p>
                      <p className="text-xs text-muted-foreground">{fine.propertyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${fine.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Pagado: {fine.resolvedAt && new Date(fine.resolvedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {paginationInfo && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasNext || isLoading}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sobre las Multas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <p>
              <strong className="text-foreground">Daños a la propiedad:</strong> Se emiten cuando se detectan daños
              causados durante tu estadía. El monto se deduce del depósito de garantía.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <p>
              <strong className="text-foreground">Violación de normas de ruido:</strong> Se aplica cuando hay quejas
              verificadas de ruido excesivo fuera de los horarios permitidos.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <p>
              <strong className="text-foreground">Check-out tardío:</strong> Se cobra si no desocupas la propiedad
              antes de la hora acordada (generalmente 11:00 AM).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <p>
              <strong className="text-foreground">Pago tardío:</strong> Se aplica cuando hay retrasos en pagos
              acordados, como extensiones de reserva.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={(open) => { setShowPayDialog(open); if (!open) setPayError(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Multa</DialogTitle>
            <DialogDescription>
              {selectedFine && fineTypeLabels[selectedFine.fineType]}
            </DialogDescription>
          </DialogHeader>
          {selectedFine && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monto a pagar</span>
                  <span className="text-2xl font-bold text-primary">${selectedFine.amount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Método de Pago
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> Si la multa es por daños a la propiedad y el monto es menor o
                  igual a tu depósito de garantía, se deducirá automáticamente del depósito al finalizar
                  tu reserva.
                </p>
              </div>

              {payError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {payError}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)} disabled={isPaying}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPay} disabled={isPaying}>
              {isPaying ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                <><CreditCard className="mr-1 h-4 w-4" /> Confirmar Pago</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}