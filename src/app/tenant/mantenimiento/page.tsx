'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { maintenanceService } from '@/lib/services/maintenance.service'
import { contractService } from '@/lib/services/contract.service'
import { reservationService } from '@/lib/services/reservation.service'
import { uploadService } from '@/lib/services/upload.service'
import { useToast } from '@/hooks/use-toast'
import { MaintenanceResponse, ContractDetailResponse, Urgency } from '@/types/api-responses'

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  RESOLVING: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programado',
  RESOLVING: 'En Proceso',
  RESOLVED: 'Resuelto',
}

const urgencyColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const urgencyLabels: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export default function MaintenancePage() {
  const { toast } = useToast()
  const [maintenances, setMaintenances] = useState<MaintenanceResponse[]>([])
  const [contracts, setContracts] = useState<ContractDetailResponse[]>([])
  const [activeReservationIds, setActiveReservationIds] = useState<Set<string>>(new Set())
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRequest, setNewRequest] = useState({
    reservationId: '',
    title: '',
    description: '',
    urgency: 'MEDIUM' as Urgency,
  })
  const [createPhotos, setCreatePhotos] = useState<Array<{ url: string; publicId: string }>>([])
  const [isUploadingCreate, setIsUploadingCreate] = useState(false)
  const createFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    maintenanceService.getAll().then((res) => setMaintenances(res.data)).catch(() => {})
    contractService.getMyContracts().then((res) => setContracts(res.data)).catch(() => {})
    reservationService.getMyReservations(0, 100).then((res) => {
      const ids = new Set(
        (res.data || [])
          .filter((r) => r.reservationStatus === 'ACTIVE' || r.reservationStatus === 'RESERVED')
          .map((r) => r.id)
      )
      setActiveReservationIds(ids)
    }).catch(() => {})
  }, [])

  const propertyByReservation = new Map(
    contracts.map((c) => [c.reservationId, c.propertyTitle])
  )

  const activeMaintenances = maintenances.filter((m) => m.maintenanceStatus !== 'RESOLVED')
  const resolvedMaintenances = maintenances.filter((m) => m.maintenanceStatus === 'RESOLVED')

  const handleCreateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setIsUploadingCreate(true)
    const results = await Promise.allSettled(files.map((f) => uploadService.uploadImage(f)))
    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof uploadService.uploadImage>>> => r.status === "fulfilled")
      .map((r) => ({ url: r.value.data.url, publicId: r.value.data.publicId }))
    setCreatePhotos((prev) => [...prev, ...uploaded])
    setIsUploadingCreate(false)
    e.target.value = ''
  }

  const handleCreate = async () => {
    if (!newRequest.reservationId || !newRequest.title) return
    setIsSubmitting(true)
    try {
      const res = await maintenanceService.create({
        reservationId: newRequest.reservationId,
        title: newRequest.title,
        description: newRequest.description || undefined,
        urgency: newRequest.urgency,
        photoUrls: createPhotos,
      })
      setMaintenances((prev) => [res.data, ...prev])
      setShowNewRequestDialog(false)
      setNewRequest({ reservationId: '', title: '', description: '', urgency: 'MEDIUM' })
      setCreatePhotos([])
    } catch (err: unknown) {
      toast({ title: 'Error al enviar', description: err instanceof Error ? err.message : 'No se pudo enviar la solicitud.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes de Mantenimiento</h1>
          <p className="text-muted-foreground">
            Reporta problemas en las propiedades donde te hospedas
          </p>
        </div>
        <Button onClick={() => setShowNewRequestDialog(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva Solicitud
        </Button>
      </div>

      {/* Active Requests */}
      {activeMaintenances.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Solicitudes Activas</h2>
          {activeMaintenances.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex gap-2 md:w-32">
                    {request.photoUrls.length > 0 ? (
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted md:w-32">
                        <img
                          src={request.photoUrls[0]}
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
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{request.title}</h3>
                        {request.reservationId &&
                          propertyByReservation.get(request.reservationId) && (
                            <p className="text-sm text-muted-foreground">
                              {propertyByReservation.get(request.reservationId)}
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
                    {request.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
                    )}
                    {request.maintenanceStatus === 'RESOLVING' && (
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
          ))}
        </div>
      )}

      {/* Resolved Requests */}
      {resolvedMaintenances.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Solicitudes Resueltas</h2>
          {resolvedMaintenances.map((request) => (
            <Card key={request.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{request.title}</h3>
                    {request.reservationId &&
                      propertyByReservation.get(request.reservationId) && (
                        <p className="text-sm text-muted-foreground">
                          {propertyByReservation.get(request.reservationId)}
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {maintenances.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No tienes solicitudes de mantenimiento</h3>
            <p className="text-muted-foreground">
              Si encuentras algún problema en tu alojamiento, repórtalo aquí
            </p>
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
            {contracts.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-800">No tienes reservas activas</h4>
                    <p className="text-sm text-amber-700">
                      Solo puedes crear solicitudes de mantenimiento para propiedades donde
                      tengas una reserva activa.
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
                    value={newRequest.reservationId}
                    onValueChange={(value) =>
                      setNewRequest({ ...newRequest, reservationId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona la propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.filter((c) => activeReservationIds.has(c.reservationId)).map((contract) => (
                        <SelectItem key={contract.reservationId} value={contract.reservationId}>
                          {contract.propertyTitle}
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
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nivel de Urgencia
                  </Label>
                  <Select
                    value={newRequest.urgency}
                    onValueChange={(value: Urgency) =>
                      setNewRequest({ ...newRequest, urgency: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gray-400" />
                          Baja - Puede esperar
                        </div>
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Media - Requiere atención pronto
                        </div>
                      </SelectItem>
                      <SelectItem value="HIGH">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          Alta - Afecta la habitabilidad
                        </div>
                      </SelectItem>
                      <SelectItem value="CRITICAL">
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
                    Fotos del problema
                  </Label>
                  <input
                    ref={createFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleCreateFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => createFileInputRef.current?.click()}
                    disabled={isUploadingCreate}
                  >
                    {isUploadingCreate ? 'Subiendo...' : `Adjuntar fotos${createPhotos.length > 0 ? ` (${createPhotos.length})` : ''}`}
                  </Button>
                </div>
                {newRequest.urgency === 'CRITICAL' && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                      <p className="text-xs text-red-800">
                        Las solicitudes críticas notifican inmediatamente al propietario y al
                        equipo de soporte de RentFlow.
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
              onClick={handleCreate}
              disabled={
                isSubmitting ||
                isUploadingCreate ||
                contracts.length === 0 ||
                !newRequest.reservationId ||
                !newRequest.title
              }
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
