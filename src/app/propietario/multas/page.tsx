"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Plus, Search, Eye, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

import { fineService } from '@/lib/services/fine.service'
import { reservationService } from '@/lib/services/reservation.service'

const fineTypeLabels: Record<string, string> = {
  PROPERTY_DAMAGE: 'Daños a la propiedad',
  NOISE_VIOLATION: 'Ruido',
  LATE_CHECKOUT: 'Check-out tardío',
  LATE_PAYMENT: 'Pago tardío',
}

const fineTypeColors: Record<string, string> = {
  PROPERTY_DAMAGE: 'bg-red-100 text-red-800',
  NOISE_VIOLATION: 'bg-orange-100 text-orange-800',
  LATE_CHECKOUT: 'bg-amber-100 text-amber-800',
  LATE_PAYMENT: 'bg-blue-100 text-blue-800',
}

export default function LandlordFinesPage() {
  const [fines, setFines] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const pageSize = 15

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedFine, setSelectedFine] = useState<any | null>(null)

  const [reservationsForSelect, setReservationsForSelect] = useState<any[]>([])
  const [newFine, setNewFine] = useState({ reservationId: '', fineType: '', amount: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fineService.getLandlordSummary()
      setSummary(res.data)
    } catch (error) {
      console.error('Error cargando resumen:', error)
    }
  }, [])

  const fetchFines = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fineService.getLandlordFines(currentPage, pageSize, typeFilter, statusFilter, searchTerm)
      setFines(res.data || [])
      setPaginationInfo(res.pagination || null)
    } catch (error) {
      console.error('Error cargando multas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, searchTerm])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFines()
    }, 300) 
    return () => clearTimeout(timer)
  }, [fetchFines])

  const fetchReservationsForDropdown = async () => {
    try {
      const res = await reservationService.getLandlordReservations(0, 50)
      setReservationsForSelect(res.data || [])
    } catch (error) {
      console.error("Error cargando reservas para el select", error)
    }
  }

  const handleOpenCreateModal = () => {
    setNewFine({ reservationId: '', fineType: '', amount: '', description: '' })
    setFormError(null)
    fetchReservationsForDropdown()
    setShowCreateDialog(true)
  }

  const handleCreateFine = async () => {
    if (!newFine.reservationId || !newFine.fineType || !newFine.amount || !newFine.description) {
      setFormError("Por favor completa todos los campos.")
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    try {
      await fineService.createFine({
        reservationId: newFine.reservationId,
        fineType: newFine.fineType,
        amount: parseFloat(newFine.amount),
        description: newFine.description
      })
      setShowCreateDialog(false)
      fetchSummary()
      fetchFines()
    } catch (error: any) {
      setFormError(error?.response?.data?.message || "Ocurrió un error al emitir la multa. Verifica el estado de la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openViewDialog = (fine: any) => {
    setSelectedFine(fine)
    setShowViewDialog(true)
  }

  const totalPages = paginationInfo?.totalPages ?? 1
  const hasNext = currentPage < totalPages - 1
  const hasPrev = currentPage > 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Multas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las multas emitidas a inquilinos</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-destructive hover:bg-destructive/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Emitir Multa
        </Button>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-slate-800">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-foreground">
              {summary ? summary.totalFines : <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Total multas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600">
              {summary ? summary.pendingCount : <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-destructive">
              {summary ? `$${summary.pendingAmount?.toFixed(2)}` : <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Por cobrar</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {summary ? `$${summary.resolvedAmount?.toFixed(2)}` : <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Cobradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, propiedad o inquilino..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                className="pl-10 bg-muted/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}>
                <SelectTrigger className="w-[150px] bg-muted/50">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="false">Pendientes</SelectItem>
                  <SelectItem value="true">Cobradas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(0); }}>
                <SelectTrigger className="w-[180px] bg-muted/50">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  <SelectItem value="PROPERTY_DAMAGE">Daños a propiedad</SelectItem>
                  <SelectItem value="NOISE_VIOLATION">Ruido</SelectItem>
                  <SelectItem value="LATE_CHECKOUT">Check-out tardío</SelectItem>
                  <SelectItem value="LATE_PAYMENT">Pago tardío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Multas (Con overflow-x-auto para que sea responsive) */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Reserva</th>
                  <th className="px-6 py-4 font-medium">Inquilino</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Descripción</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : fines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      No se encontraron multas con estos filtros.
                    </td>
                  </tr>
                ) : (
                  fines.map((fine) => (
                    <tr key={fine.fineId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {fine.fineId.split('-')[0].toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {fine.reservationId.split('-')[0].toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{fine.tenantName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`border-none ${fineTypeColors[fine.fineType] || 'bg-gray-100 text-gray-800'}`}>
                          {fineTypeLabels[fine.fineType] || fine.fineType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={fine.description}>
                        {fine.description}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ${fine.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(fine.issuedAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        {fine.resolvedAt ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Pagada</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pendiente</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" size="icon" className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => openViewDialog(fine)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={!hasPrev || isLoading}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={!hasNext || isLoading}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: EMITIR MULTA */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if(!open) setFormError(null) }}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Emitir Nueva Multa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reserva</Label>
              <Select value={newFine.reservationId} onValueChange={(val) => setNewFine({...newFine, reservationId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la reserva..." />
                </SelectTrigger>
                <SelectContent>
                  {reservationsForSelect
                    .filter(r => r.reservationStatus === 'ACTIVE')
                    .map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        RES-{r.id.split('-')[0].toUpperCase()} - {r.tenantName} ({r.propertyName})
                      </SelectItem>
                    ))}
                  {reservationsForSelect.filter(r => r.reservationStatus === 'ACTIVE').length === 0 && (
                    <SelectItem value="empty" disabled>
                      {reservationsForSelect.length === 0 ? 'Cargando reservas...' : 'No hay reservas activas'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Multa</Label>
              <Select value={newFine.fineType} onValueChange={(val) => setNewFine({...newFine, fineType: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPERTY_DAMAGE">Daños a la propiedad</SelectItem>
                  <SelectItem value="NOISE_VIOLATION">Violación de ruido</SelectItem>
                  <SelectItem value="LATE_CHECKOUT">Check-out tardío</SelectItem>
                  <SelectItem value="LATE_PAYMENT">Pago tardío</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monto (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={newFine.amount}
                onChange={(e) => setNewFine({...newFine, amount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                placeholder="Describe el motivo de la multa con detalle..." 
                rows={3}
                value={newFine.description}
                onChange={(e) => setNewFine({...newFine, description: e.target.value})}
              />
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-3 items-start mt-2">
               <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-sm text-amber-800">
                 <strong>Importante:</strong> El inquilino recibirá una notificación sobre esta multa y deberá pagarla. Si es daño a la propiedad, se priorizará cobrarla del depósito de garantía al finalizar.
               </p>
            </div>

            {formError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button className="bg-destructive hover:bg-destructive/90 text-white" onClick={handleCreateFine} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Emitiendo...</> : "Emitir Multa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: VER DETALLE (Botón del Ojito) */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Detalle de la Multa</DialogTitle>
          </DialogHeader>
          {selectedFine && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground text-sm">ID de Multa</span>
                <span className="font-mono font-medium">{selectedFine.fineId.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground text-sm">Inquilino</span>
                <span className="font-medium">{selectedFine.tenantName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground text-sm">Propiedad</span>
                <span className="font-medium text-right max-w-[200px] truncate" title={selectedFine.propertyName}>
                  {selectedFine.propertyName}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground text-sm">Fecha de Emisión</span>
                <span className="font-medium">{new Date(selectedFine.issuedAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground text-sm">Estado</span>
                {selectedFine.resolvedAt ? (
                  <Badge className="bg-green-100 text-green-700 border-none">
                    Pagada ({new Date(selectedFine.resolvedAt).toLocaleDateString('es-ES')})
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-none">Pendiente</Badge>
                )}
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg space-y-2 mt-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Motivo</p>
                <Badge variant="outline" className={`border-none ${fineTypeColors[selectedFine.fineType]}`}>
                  {fineTypeLabels[selectedFine.fineType]}
                </Badge>
                <p className="text-sm mt-2 leading-relaxed">{selectedFine.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Monto Total</span>
                <span className="font-bold text-2xl text-destructive">${selectedFine.amount.toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}