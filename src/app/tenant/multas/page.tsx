'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle2, CreditCard, DollarSign, Home, CalendarDays, AlertCircle } from 'lucide-react'
import { mockReservations, mockFines } from '@/lib/mock-data'

const fineTypeLabels = {
  property_damage: 'Daños a la propiedad',
  noise_violation: 'Violación de normas de ruido',
  late_checkout: 'Check-out tardío',
  late_payment: 'Pago tardío',
}

const fineTypeColors = {
  property_damage: 'bg-red-100 text-red-800',
  noise_violation: 'bg-orange-100 text-orange-800',
  late_checkout: 'bg-amber-100 text-amber-800',
  late_payment: 'bg-blue-100 text-blue-800',
}

export default function FinesPage() {
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [selectedFine, setSelectedFine] = useState<typeof mockFines[0] | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const pendingFines = mockFines.filter(f => !f.resolvedAt)
  const paidFines = mockFines.filter(f => f.resolvedAt)
  const totalPending = pendingFines.reduce((sum, f) => sum + f.amount, 0)

  const getReservationForFine = (reservationId: string) => {
    return mockReservations.find(r => r.id === reservationId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Multas</h1>
        <p className="text-muted-foreground">Gestiona las multas asociadas a tus reservas</p>
      </div>

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
      {mockFines.length === 0 && (
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
          {pendingFines.map((fine) => {
            const reservation = getReservationForFine(fine.reservationId)
            return (
              <Card key={fine.id} className="border-destructive/20">
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
                        {reservation && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              {reservation.property.title}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Emitida: {new Date(fine.issuedAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-destructive">${fine.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Monto a pagar</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedFine(fine)
                          setShowPayDialog(true)
                        }}
                      >
                        <CreditCard className="mr-1 h-4 w-4" /> Pagar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paid Fines */}
      {paidFines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Multas Pagadas</h2>
          {paidFines.map((fine) => {
            const reservation = getReservationForFine(fine.reservationId)
            return (
              <Card key={fine.id} className="opacity-75">
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
                        {reservation && (
                          <p className="text-xs text-muted-foreground">
                            {reservation.property.title}
                          </p>
                        )}
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
            )
          })}
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
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
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
                    <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="bank_transfer">Depósito Bancario</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              Cancelar
            </Button>
            <Button>
              <CreditCard className="mr-1 h-4 w-4" /> Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
