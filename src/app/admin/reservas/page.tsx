"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Eye,
  Calendar,
  User,
  Building2,
  DollarSign,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Loader2,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { reservationService } from "@/lib/services/reservation.service"
import { ReservationResponse, ReservationDetailResponse, PaginationMeta } from "@/types/api-responses"

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  RESERVED: { label: "Reservada", color: "bg-blue-100 text-blue-700", icon: Clock },
  ACTIVE: { label: "Activa", color: "bg-green-100 text-green-700", icon: PlayCircle },
  COMPLETED: { label: "Completada", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
}

const formatFullLongDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | "all">("all")

  const [currentPage, setCurrentPage] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<PaginationMeta | null>(null)
  const pageSize = 15

  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<ReservationDetailResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showTenantDialog, setShowTenantDialog] = useState(false)
  const [showPropertyDialog, setShowPropertyDialog] = useState(false)

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(0)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const fetchAllReservations = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await reservationService.getAllReservations(
        currentPage,
        pageSize,
        searchTerm,
        statusFilter
      )
      setReservations(res.data || [])
      setPaginationInfo(res.pagination || null)
    } catch (error) {
      console.error("Error cargando todas las reservas:", error)
      setFetchError("No se pudieron cargar las reservas. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter])

  useEffect(() => {
    fetchAllReservations()
  }, [fetchAllReservations])

  // Extracción de valores de paginación.
  // OJO: el backend (PaginationMeta.fromPage en Java) manda "totalItems" y
  // "hastNext" (con typo: "hastNext", no "hasNext"). Antes leíamos
  // "totalElements"/"hasNext", que NUNCA existen en la respuesta real, por
  // lo que "hasNext" siempre caía al fallback `false` y el botón
  // "Siguiente" quedaba permanentemente deshabilitado.
  // -> Actualiza también el tipo PaginationMeta en types/api-responses.ts
  //    para que declare totalItems/hastNext en vez de totalElements/hasNext.
  const totalElements = paginationInfo?.totalItems ?? 0
  const totalPages = paginationInfo?.totalPages ?? 1
  const hasNext = paginationInfo?.hastNext ?? false

  // OJO: como "reservations" es solo la página actual (máx. 15 filas) que ya
  // viene filtrada por el backend, estos contadores de estado solo reflejan
  // lo que se ve en esta página, no el total del sistema. Si necesitas
  // contadores globales por estado, lo correcto es traerlos de un endpoint
  // de resumen (como existe para landlord en /reservations/landlord/summary)
  // y no derivarlos del array paginado.
  const stats = {
    total: totalElements,
    active: reservations.filter((r) => r.reservationStatus === "ACTIVE").length,
    completed: reservations.filter((r) => r.reservationStatus === "COMPLETED").length,
    cancelled: reservations.filter((r) => r.reservationStatus === "CANCELLED").length,
  }

  const handleOpenAction = async (reservation: ReservationResponse, action: 'detail' | 'tenant' | 'property') => {
    setSelectedReservation(reservation)

    if (action === 'detail') setShowDetailDialog(true)
    if (action === 'tenant') setShowTenantDialog(true)
    if (action === 'property') setShowPropertyDialog(true)

    setIsDetailLoading(true)
    try {
      const res = await reservationService.getLandlordReservationDetail(reservation.id)
      setSelectedDetail(res.data)
    } catch (error) {
      console.error("Error cargando detalle:", error)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const executeCancelReservation = async () => {
    if (!selectedReservation) return
    setIsCanceling(true)
    try {
      await reservationService.cancelReservation(selectedReservation.id)
      setShowCancelDialog(false)
      fetchAllReservations()
    } catch (error) {
      console.error("Error cancelando reserva:", error)
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reservas del Sistema</h1>
        <p className="text-muted-foreground mt-1">Supervisión de todas las reservas de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mt-1" /> : stats.total}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Curso (esta página)</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mt-1" /> : stats.active}
                </p>
              </div>
              <PlayCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas (esta página)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mt-1" /> : stats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canceladas (esta página)</p>
                <p className="text-2xl font-bold text-red-600">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mt-1" /> : stats.cancelled}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, inquilino, propiedad o propietario..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "Todos los estados" : statusConfig[statusFilter]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setStatusFilter("all"); setCurrentPage(0); }}>Todos los estados</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("RESERVED"); setCurrentPage(0); }}>Reservadas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("ACTIVE"); setCurrentPage(0); }}>Activas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("COMPLETED"); setCurrentPage(0); }}>Completadas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("CANCELLED"); setCurrentPage(0); }}>Canceladas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4" />
          {fetchError}
        </div>
      )}

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Reservas {paginationInfo && `(${totalElements} en total)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="space-y-0 divide-y divide-border">
                {reservations.map((reservation) => {
                  const status = statusConfig[reservation.reservationStatus] || { label: reservation.reservationStatus, color: "bg-gray-100 text-gray-700", icon: CheckCircle }
                  const StatusIcon = status.icon

                  return (
                    <div
                      key={reservation.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground uppercase">RES-{reservation.id.split('-')[0]}</h3>
                            <p className="text-sm text-muted-foreground">{reservation.propertyName}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground md:ml-13 mt-2 md:mt-0">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {reservation.tenantName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {reservation.landlordName || "Propietario no disp."}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(reservation.checkInDate).toLocaleDateString("es-ES")} - {new Date(reservation.checkOutDate).toLocaleDateString("es-ES")}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${reservation.totalPrice?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenAction(reservation, 'detail')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAction(reservation, 'tenant')}>
                              <User className="w-4 h-4 mr-2" />
                              Ver inquilino
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAction(reservation, 'property')}>
                              <Building2 className="w-4 h-4 mr-2" />
                              Ver propiedad
                            </DropdownMenuItem>

                            {(reservation.reservationStatus === "RESERVED" || reservation.reservationStatus === "ACTIVE") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Cancelar reserva
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}

                {reservations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron reservas con estos filtros</p>
                  </div>
                )}
              </div>

              {/* CONTROLES DE PAGINACIÓN UI */}
              {paginationInfo && totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t bg-muted/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
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
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasNext || isLoading}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: VER DETALLES */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle de Reserva (Admin)</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {selectedReservation?.propertyName}
            </DialogDescription>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedDetail && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 px-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                  <p className="font-medium text-[15px]">
                    {formatFullLongDate(selectedDetail.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                  <p className="font-medium text-[15px]">
                    {formatFullLongDate(selectedDetail.checkOutDate)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <h4 className="font-semibold mb-3">Finanzas</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Estadía base ({selectedDetail.totalNights} noches)</span>
                    <span>${selectedDetail.baseTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa de limpieza</span>
                    <span>${selectedDetail.cleaningFee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depósito (reembolsable)</span>
                    <span>${selectedDetail.property?.securityDepositAmount?.toFixed(2) || "150.00"}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-3 font-bold text-base text-foreground">
                    <span>Total Pagado</span>
                    <span className="text-primary">${selectedDetail.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: VER INQUILINO */}
      <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Información del Inquilino</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : selectedDetail && (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedDetail.tenantName}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Mail className="h-4 w-4" /> {selectedDetail.tenantEmail}
                </p>
                <Badge className="mt-3" variant="secondary">Inquilino Verificado</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: VER PROPIEDAD */}
      <Dialog open={showPropertyDialog} onOpenChange={setShowPropertyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Información de la Propiedad</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : selectedDetail?.property && (
            <div className="space-y-4 py-2">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                {/*
                  IMPORTANTE: "mainPhotoUrl" no existe en el tipo ReservationDetailResponse.property
                  (revisa types/api-responses.ts). Esto es un fuerte indicio de que tu
                  PropertySummaryResponse del backend no está mandando ninguna URL de imagen,
                  o la manda con otro nombre de campo. Abre el Network tab del navegador,
                  inspecciona la respuesta real de GET /api/reservations/{id} y revisa qué
                  campo trae "property" para la imagen (si alguno). Ajusta este acceso y el
                  tipo de TypeScript para que coincidan exactamente con ese campo.
                */}
                {(selectedDetail.property as any).mainPhotoUrl ? (
                  <img
                    src={(selectedDetail.property as any).mainPhotoUrl}
                    alt={selectedDetail.property.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      // Mientras depuras, comenta la línea de abajo y revisa la consola/Network
                      // para ver el error real (404, CORS, mixed-content, etc).
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground/30 z-10" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedDetail.property.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedDetail.property.address}, {selectedDetail.property.city}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-sm flex justify-between items-center">
                <span className="font-medium">Precio por Noche</span>
                <span className="font-bold text-primary">${selectedDetail.property.basePricePerNight?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: CANCELAR RESERVA */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la reserva de <strong>{selectedReservation?.tenantName}</strong> para la propiedad <strong>{selectedReservation?.propertyName}</strong>?
              <br /><br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCanceling}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={executeCancelReservation}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelando...</>
              ) : (
                "Confirmar Cancelación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}