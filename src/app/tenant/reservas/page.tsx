'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Home, 
  MapPin, 
  CalendarDays, 
  Clock, 
  Users, 
  CreditCard, 
  Key, 
  FileText, 
  ChevronRight, 
  CalendarIcon,
  AlertTriangle,
  Star
} from 'lucide-react'
import { mockReservations, type Reservation } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const statusColors = {
  reserved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  reserved: 'Reservada',
  active: 'En Curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export default function ReservationsPage() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date | undefined>()

  const activeReservations = mockReservations.filter(
    r => r.reservationStatus === 'active' || r.reservationStatus === 'reserved'
  )
  const completedReservations = mockReservations.filter(
    r => r.reservationStatus === 'completed'
  )
  const cancelledReservations = mockReservations.filter(
    r => r.reservationStatus === 'cancelled'
  )

  const calculateExtensionCost = (reservation: Reservation, newDate: Date) => {
    const currentCheckout = new Date(reservation.checkOutDate)
    const additionalNights = Math.ceil((newDate.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24))
    return additionalNights * reservation.property.basePricePerNight
  }

  const calculateCancellationPenalty = (reservation: Reservation) => {
    const checkIn = new Date(reservation.checkInDate)
    const today = new Date()
    const daysUntilCheckin = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilCheckin >= 7) {
      return { penalty: 0, refund: reservation.baseTotal, message: 'Reembolso completo del 100%' }
    } else if (daysUntilCheckin >= 3) {
      return { penalty: reservation.baseTotal * 0.5, refund: reservation.baseTotal * 0.5, message: 'Penalización del 50%' }
    } else {
      return { penalty: reservation.baseTotal, refund: 0, message: 'Sin reembolso (menos de 3 días)' }
    }
  }

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="aspect-video w-full bg-muted md:aspect-square md:w-48">
          <img
            src={reservation.property.photos[0]}
            alt={reservation.property.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{reservation.property.title}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {reservation.property.city}, {reservation.property.department}
              </p>
            </div>
            <Badge className={statusColors[reservation.reservationStatus]}>
              {statusLabels[reservation.reservationStatus]}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="font-medium">
                  {new Date(reservation.checkInDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Huéspedes</p>
                <p className="font-medium">{reservation.guestsCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-medium text-primary">${reservation.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedReservation(reservation)}
                >
                  Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Detalle de Reserva</DialogTitle>
                  <DialogDescription>
                    {reservation.property.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="font-semibold">Información de la Propiedad</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{reservation.property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.property.city}, {reservation.property.department}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <p className="font-medium">
                        {new Date(reservation.checkInDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-medium">
                        {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-semibold">Desglose de Precios</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>${reservation.property.basePricePerNight} x {reservation.totalNights} noches</span>
                        <span>${reservation.baseTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarifa de limpieza</span>
                        <span>${reservation.cleaningFee.toFixed(2)}</span>
                      </div>
                      {reservation.longStayDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento estadía larga</span>
                          <span>-${reservation.longStayDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Depósito de garantía</span>
                        <span>${reservation.property.securityDepositAmount.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
                        <span>Total</span>
                        <span className="text-primary">${reservation.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {reservation.accessCode && (reservation.reservationStatus === 'active' || reservation.reservationStatus === 'reserved') && (
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                      <div className="flex items-center gap-3">
                        <Key className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Código de Acceso</p>
                          <p className="font-mono text-lg font-bold">{reservation.accessCode}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {(reservation.reservationStatus === 'active' || reservation.reservationStatus === 'reserved') && (
              <>
                {reservation.accessCode && (
                  <Button variant="outline" size="sm">
                    <Key className="mr-1 h-4 w-4" /> {reservation.accessCode}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedReservation(reservation)
                    setShowExtendDialog(true)
                  }}
                >
                  Extender
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    setSelectedReservation(reservation)
                    setShowCancelDialog(true)
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}

            {reservation.reservationStatus === 'completed' && (
              <Button variant="outline" size="sm">
                <Star className="mr-1 h-4 w-4" /> Calificar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Reservas</h1>
        <p className="text-muted-foreground">Gestiona todas tus reservas en RentFlow</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Activas ({activeReservations.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedReservations.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No tienes reservas activas</h3>
                <p className="text-muted-foreground">Busca propiedades para hacer tu próxima reserva</p>
              </CardContent>
            </Card>
          ) : (
            activeReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No tienes reservas completadas</h3>
                <p className="text-muted-foreground">Tus reservas pasadas aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            completedReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-4">
          {cancelledReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No tienes reservas canceladas</h3>
                <p className="text-muted-foreground">Las reservas canceladas aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            cancelledReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Extend Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extender Reserva</DialogTitle>
            <DialogDescription>
              Selecciona la nueva fecha de check-out
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fecha actual de check-out
                </Label>
                <p className="mt-1 font-medium">
                  {new Date(selectedReservation.checkOutDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nueva fecha de check-out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'mt-1 w-full justify-start text-left font-normal',
                        !newCheckoutDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCheckoutDate ? format(newCheckoutDate, 'PPP', { locale: es }) : 'Selecciona fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={setNewCheckoutDate}
                      disabled={(date) => date <= new Date(selectedReservation.checkOutDate)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Método de Pago
                </Label>
                <Select defaultValue="card">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCheckoutDate && (
                <div className="rounded-lg bg-secondary p-4">
                  <h4 className="font-semibold">Costo de Extensión</h4>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    ${calculateExtensionCost(selectedReservation, newCheckoutDate).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.ceil((newCheckoutDate.getTime() - new Date(selectedReservation.checkOutDate).getTime()) / (1000 * 60 * 60 * 24))} noches adicionales × ${selectedReservation.property.basePricePerNight}/noche
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancelar
            </Button>
            <Button disabled={!newCheckoutDate}>
              Confirmar Extensión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta reserva?
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Política de Cancelación</h4>
                    {(() => {
                      const penalty = calculateCancellationPenalty(selectedReservation)
                      return (
                        <div className="mt-2 text-sm text-amber-700">
                          <p>{penalty.message}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span>Penalización:</span>
                              <span className="font-medium">${penalty.penalty.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reembolso base:</span>
                              <span className="font-medium">${penalty.refund.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tarifa limpieza (reembolsable):</span>
                              <span className="font-medium">${selectedReservation.cleaningFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Depósito (reembolsable):</span>
                              <span className="font-medium">${selectedReservation.property.securityDepositAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-4">
                <h4 className="font-semibold">Propiedad</h4>
                <p className="text-sm text-muted-foreground">{selectedReservation.property.title}</p>
                <p className="mt-2 text-sm">
                  {new Date(selectedReservation.checkInDate).toLocaleDateString('es-ES')} - {new Date(selectedReservation.checkOutDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Volver
            </Button>
            <Button variant="destructive">
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
