'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { FileText, CheckCircle2, Clock, AlertCircle, Download, Pen, Home, CalendarDays } from 'lucide-react'
import { mockContracts, mockReservations } from '@/lib/mock-data'

const statusColors = {
  pending_signatures: 'bg-amber-100 text-amber-800',
  signed: 'bg-green-100 text-green-800',
}

const statusLabels = {
  pending_signatures: 'Pendiente de Firmas',
  signed: 'Firmado',
}

export default function ContractsPage() {
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [selectedContract, setSelectedContract] = useState<typeof mockContracts[0] | null>(null)

  const getReservationForContract = (contractId: string) => {
    const contract = mockContracts.find(c => c.id === contractId)
    if (!contract) return null
    return mockReservations.find(r => r.id === contract.reservationId)
  }

  const pendingContracts = mockContracts.filter(c => c.contractStatus === 'pending_signatures')
  const signedContracts = mockContracts.filter(c => c.contractStatus === 'signed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Contratos</h1>
        <p className="text-muted-foreground">Revisa y firma tus contratos de alquiler</p>
      </div>

      {/* Pending Contracts Alert */}
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

      {/* Contracts List */}
      <div className="space-y-4">
        {mockContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No tienes contratos</h3>
              <p className="text-muted-foreground">Los contratos de tus reservas aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          mockContracts.map((contract) => {
            const reservation = getReservationForContract(contract.id)
            if (!reservation) return null

            const isExpired = new Date(contract.expiresAt) < new Date()
            const canSign = contract.contractStatus === 'pending_signatures' && !contract.tenantSigned && !isExpired

            return (
              <Card key={contract.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex items-center justify-center bg-secondary p-6 md:w-48">
                    <FileText className="h-16 w-16 text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">Contrato de Alquiler</h3>
                        <p className="text-sm text-muted-foreground">{reservation.property.title}</p>
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
                          <p className="font-medium">{reservation.property.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Período</p>
                          <p className="font-medium">
                            {new Date(reservation.checkInDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {contract.contractStatus === 'signed' ? 'Firmado el' : 'Vence el'}
                          </p>
                          <p className={`font-medium ${isExpired && contract.contractStatus !== 'signed' ? 'text-destructive' : ''}`}>
                            {new Date(contract.contractStatus === 'signed' ? contract.createdAt : contract.expiresAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Firmas</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {contract.tenantSigned ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-xs">Tú</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {contract.landlordSigned ? (
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-1 h-4 w-4" /> Ver Contrato
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Contrato de Alquiler</DialogTitle>
                            <DialogDescription>
                              {reservation.property.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-96 overflow-y-auto rounded-lg border border-border p-4">
                            <div className="space-y-4 text-sm">
                              <div className="text-center">
                                <h2 className="text-lg font-bold">CONTRATO DE ARRENDAMIENTO TEMPORAL</h2>
                                <p className="text-muted-foreground">RentFlow - Hogares de Autor</p>
                              </div>

                              <div>
                                <h3 className="font-semibold">1. PARTES CONTRATANTES</h3>
                                <p className="mt-1 text-muted-foreground">
                                  Entre el ARRENDADOR, propietario de la propiedad descrita, y el ARRENDATARIO, 
                                  identificado en la plataforma RentFlow, se celebra el presente contrato.
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold">2. OBJETO DEL CONTRATO</h3>
                                <p className="mt-1 text-muted-foreground">
                                  <strong>Propiedad:</strong> {reservation.property.title}<br />
                                  <strong>Dirección:</strong> {reservation.property.address}<br />
                                  <strong>Ubicación:</strong> {reservation.property.city}, {reservation.property.department}
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold">3. PERÍODO DE ARRENDAMIENTO</h3>
                                <p className="mt-1 text-muted-foreground">
                                  <strong>Check-in:</strong> {new Date(reservation.checkInDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a partir de las 3:00 PM<br />
                                  <strong>Check-out:</strong> {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} antes de las 11:00 AM<br />
                                  <strong>Total noches:</strong> {reservation.totalNights}
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold">4. PRECIO Y FORMA DE PAGO</h3>
                                <p className="mt-1 text-muted-foreground">
                                  <strong>Precio por noche:</strong> ${reservation.property.basePricePerNight.toFixed(2)}<br />
                                  <strong>Subtotal hospedaje:</strong> ${reservation.baseTotal.toFixed(2)}<br />
                                  <strong>Tarifa de limpieza:</strong> ${reservation.cleaningFee.toFixed(2)}<br />
                                  <strong>Depósito de garantía:</strong> ${reservation.property.securityDepositAmount.toFixed(2)}<br />
                                  <strong>TOTAL:</strong> ${reservation.totalPrice.toFixed(2)}
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold">5. REGLAS DE LA PROPIEDAD</h3>
                                <p className="mt-1 text-muted-foreground">
                                  {reservation.property.rules}
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold">6. POLÍTICA DE CANCELACIÓN</h3>
                                <p className="mt-1 text-muted-foreground">
                                  - Cancelación 7+ días antes del check-in: Reembolso del 100%<br />
                                  - Cancelación entre 3-7 días: Penalización del 50%<br />
                                  - Cancelación menos de 3 días: Sin reembolso
                                </p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">
                              <Download className="mr-1 h-4 w-4" /> Descargar PDF
                            </Button>
                            {canSign && (
                              <Button onClick={() => {
                                setSelectedContract(contract)
                                setShowSignDialog(true)
                              }}>
                                <Pen className="mr-1 h-4 w-4" /> Firmar Contrato
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" /> Descargar
                      </Button>

                      {canSign && (
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

                      {isExpired && contract.contractStatus === 'pending_signatures' && (
                        <Badge variant="destructive">Expirado</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Sign Dialog */}
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
                <p className="font-serif text-2xl italic text-primary">Juan Pérez</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Firma generada con hash SHA-256 el {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800">
                Esta firma tiene validez legal electrónica. Una vez firmado, el contrato no podrá modificarse 
                sin el consentimiento de ambas partes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancelar
            </Button>
            <Button>
              <Pen className="mr-1 h-4 w-4" /> Confirmar Firma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
