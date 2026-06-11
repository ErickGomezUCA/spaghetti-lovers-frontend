'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Home,
  CalendarDays
} from 'lucide-react'
import { mockMaintenanceRequests, mockReservations, type MaintenanceRequest } from '@/lib/mock-data'

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  resolving: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
}

const statusLabels = {
  scheduled: 'Programado',
  resolving: 'En Proceso',
  resolved: 'Resuelto',
}

const urgencyColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const urgencyLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export default function MaintenancePage() {
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [newRequest, setNewRequest] = useState({
    propertyId: '',
    title: '',
    description: '',
    urgency: 'medium' as MaintenanceRequest['urgency'],
  })

  // Get active reservations for creating maintenance requests
  const activeReservations = mockReservations.filter(
    r => r.reservationStatus === 'active'
  )

  const pendingRequests = mockMaintenanceRequests.filter(r => r.maintenanceStatus !== 'resolved')
  const resolvedRequests = mockMaintenanceRequests.filter(r => r.maintenanceStatus === 'resolved')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes de Mantenimiento</h1>
          <p className="text-muted-foreground">Reporta problemas en las propiedades donde te hospedas</p>
        </div>
        <Button onClick={() => setShowNewRequestDialog(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva Solicitud
        </Button>
      </div>

      {/* Active Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Solicitudes Activas</h2>
          {pendingRequests.map((request) => {
            const reservation = mockReservations.find(r => r.id === request.reservationId)
            return (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    {/* Photos */}
                    <div className="flex gap-2 md:w-32">
                      {request.photos.length > 0 ? (
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted md:w-32">
                          <img
                            src={request.photos[0]}
                            alt="Foto del problema"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted md:w-32">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{request.title}</h3>
                          {reservation && (
                            <p className="text-sm text-muted-foreground">
                              {reservation.property.title}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={urgencyColors[request.urgency]}>
                            {urgencyLabels[request.urgency]}
                          </Badge>
                          <Badge className={statusColors[request.maintenanceStatus]}>
                            {statusLabels[request.maintenanceStatus]}
                          </Badge>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>

                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          Reportado: {new Date(request.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {request.maintenanceStatus === 'resolving' && (
                        <div className="mt-4 rounded-lg bg-amber-50 p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">
                              El propietario está trabajando en resolver este problema
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resolved Requests */}
      {resolvedRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Solicitudes Resueltas</h2>
          {resolvedRequests.map((request) => {
            const reservation = mockReservations.find(r => r.id === request.reservationId)
            return (
              <Card key={request.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{request.title}</h3>
                      {reservation && (
                        <p className="text-sm text-muted-foreground">
                          {reservation.property.title}
                        </p>
                      )}
                    </div>
                    <Badge className={statusColors[request.maintenanceStatus]}>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {statusLabels[request.maintenanceStatus]}
                    </Badge>
                  </div>
                  {request.resolutionNotes && (
                    <div className="mt-2 rounded-lg bg-green-50 p-3">
                      <p className="text-sm text-green-800">
                        <strong>Resolución:</strong> {request.resolutionNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {mockMaintenanceRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No tienes solicitudes de mantenimiento</h3>
            <p className="text-muted-foreground">Si encuentras algún problema en tu alojamiento, repórtalo aquí</p>
            <Button className="mt-4" onClick={() => setShowNewRequestDialog(true)}>
              <Plus className="mr-1 h-4 w-4" /> Crear Solicitud
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Mantenimiento</DialogTitle>
            <DialogDescription>
              Describe el problema que encontraste en la propiedad
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {activeReservations.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-800">No tienes reservas activas</h4>
                    <p className="text-sm text-amber-700">
                      Solo puedes crear solicitudes de mantenimiento para propiedades donde tengas una reserva activa.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Propiedad
                  </Label>
                  <Select 
                    value={newRequest.propertyId} 
                    onValueChange={(value) => setNewRequest({ ...newRequest, propertyId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona la propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeReservations.map((reservation) => (
                        <SelectItem key={reservation.id} value={reservation.propertyId}>
                          {reservation.property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Título del Problema
                  </Label>
                  <Input
                    className="mt-1"
                    placeholder="Ej: Fuga de agua en el baño"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Descripción Detallada
                  </Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Describe el problema con el mayor detalle posible..."
                    rows={4}
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nivel de Urgencia
                  </Label>
                  <Select 
                    value={newRequest.urgency} 
                    onValueChange={(value: MaintenanceRequest['urgency']) => 
                      setNewRequest({ ...newRequest, urgency: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gray-400" />
                          Baja - Puede esperar
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Media - Requiere atención pronto
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          Alta - Afecta la habitabilidad
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Crítica - Emergencia (fuga, sin luz, etc.)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fotos del Problema
                  </Label>
                  <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Arrastra fotos aquí o haz clic para seleccionar
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Seleccionar Fotos
                      </Button>
                    </div>
                  </div>
                </div>

                {newRequest.urgency === 'critical' && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <p className="text-xs text-red-800">
                        Las solicitudes críticas notifican inmediatamente al propietario y al equipo de soporte de RentFlow.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              Cancelar
            </Button>
            <Button 
              disabled={activeReservations.length === 0 || !newRequest.propertyId || !newRequest.title}
            >
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
