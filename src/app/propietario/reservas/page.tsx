"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { reservationService } from "@/lib/services/reservation.service"
import { ReservationCancellationPreviewResponse } from "@/types/api-responses"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle
} from "lucide-react"

import { ReservationResponse, LandlordReservationSummaryResponse, ReservationDetailResponse } from "@/types/api-responses"

const statusColors: Record<string, string> = {
  RESERVED: "bg-blue-100 text-blue-700 border-blue-200",
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  RESERVED: "Reservada",
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
}

const statusIcons: Record<string, React.ReactNode> = {
  RESERVED: <Clock className="w-4 h-4" />,
  ACTIVE: <CheckCircle className="w-4 h-4" />,
  COMPLETED: <CheckCircle className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
}

export default function ReservationsPage() {
  // Estados de la Tabla
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [summary, setSummary] = useState<LandlordReservationSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Estados del Modal de Detalle
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<ReservationDetailResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  //Estados de cancelación
  const [selectedReservation, setSelectedReservation] =
      useState<ReservationResponse | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellationPreview, setCancellationPreview] =
      useState<ReservationCancellationPreviewResponse | null>(null)
  const [isLoadingCancellationPreview, setIsLoadingCancellationPreview] =
      useState(false)
  const [isCancellingReservation, setIsCancellingReservation] = useState(false)
  const [cancellationError, setCancellationError] = useState<string | null>(null)

  // Cargar lista principal
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true)
      try {
        const [summaryRes, tableRes] = await Promise.all([
          reservationService.getLandlordSummary(),
          reservationService.getLandlordReservations(0, 50, statusFilter === "ALL" ? undefined : statusFilter, searchTerm)
        ])

        setSummary(summaryRes.data)
        setReservations(tableRes.data)
      } catch (error) {
        console.error("Error cargando reservas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchReservations()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [statusFilter, searchTerm])

  // Función para abrir el modal y buscar el detalle
  const handleViewDetails = async (id: string) => {
    setIsModalOpen(true)
    setIsDetailLoading(true)
    try {
      const res = await reservationService.getLandlordReservationDetail(id)
      setSelectedDetail(res.data)
    } catch (error) {
      console.error("Error cargando detalles:", error)
    } finally {
      setIsDetailLoading(false)
    }
  }

    const handleOpenCancelDialog = async (reservationId: string) => {
        const reservation = reservations.find((r) => r.id === reservationId) ?? null

        setSelectedReservation(reservation)
        setShowCancelDialog(true)
        setCancellationPreview(null)
        setCancellationError(null)
        setIsLoadingCancellationPreview(true)

        try {
            const response = await reservationService.previewCancellation(reservationId)
            setCancellationPreview(response.data)
        } catch (error) {
            console.error("Error loading cancellation preview:", error)
            setCancellationError(
                "No se pudo cargar el resumen de cancelación para esta reserva.",
            )
        } finally {
            setIsLoadingCancellationPreview(false)
        }
    }

    const handleConfirmCancellation = async () => {
        if (!selectedReservation) return

        setIsCancellingReservation(true)
        setCancellationError(null)

        try {
            const response = await reservationService.cancelReservation(
                selectedReservation.id,
            )

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.id === response.data.reservationId
                        ? {
                            ...reservation,
                            reservationStatus: "CANCELLED",
                        }
                        : reservation,
                ),
            )

            setSummary((prev) =>
                prev
                    ? {
                        ...prev,
                        reserved:
                            selectedReservation.reservationStatus === "RESERVED"
                                ? Math.max(prev.reserved - 1, 0)
                                : prev.reserved,
                        active:
                            selectedReservation.reservationStatus === "ACTIVE"
                                ? Math.max(prev.active - 1, 0)
                                : prev.active,
                        cancelled: prev.cancelled + 1,
                    }
                    : prev,
            )

            setShowCancelDialog(false)
            setSelectedReservation(null)
            setCancellationPreview(null)
        } catch (error) {
            console.error("Error cancelling reservation:", error)
            setCancellationError("No se pudo cancelar la reserva.")
        } finally {
            setIsCancellingReservation(false)
        }
    }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reservas</h1>
          <p className="text-muted-foreground">Gestiona las reservas de tus propiedades</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por propiedad o inquilino..."
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
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="RESERVED">Reservada</SelectItem>
                <SelectItem value="ACTIVE">Activa</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {summary ? summary.reserved : "0"}
            </p>
            <p className="text-sm text-muted-foreground">Reservadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {summary ? summary.active : "0"}
            </p>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-600">
              {summary ? summary.completed : "0"}
            </p>
            <p className="text-sm text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">
              {summary ? summary.cancelled : "0"}
            </p>
            <p className="text-sm text-muted-foreground">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card className="border-t-4 border-t-primary relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propiedad</TableHead>
                <TableHead>Inquilino</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Huéspedes</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 && !isLoading && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                     No se encontraron reservas con estos filtros.
                   </TableCell>
                 </TableRow>
              )}
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">{reservation.propertyName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{reservation.tenantEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{reservation.checkInDate}</span>
                      <span>→</span>
                      <span>{reservation.checkOutDate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {reservation.totalNights} noches
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {reservation.guestsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {reservation.totalPrice.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[reservation.reservationStatus] || "bg-gray-100"}>
                      <span className="flex items-center gap-1">
                        {statusIcons[reservation.reservationStatus]}
                        {statusLabels[reservation.reservationStatus] || reservation.reservationStatus}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(reservation.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Link href={`/propietario/contratos?reservationId=${reservation.id}`}>
                        <Button variant="ghost" size="icon">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ÚNICO MODAL DE DETALLES */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalle de Reserva {selectedDetail?.id?.substring(0, 8).toUpperCase() || ""}
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Propiedad</p>
                  <p className="font-medium">{selectedDetail.property?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inquilino</p>
                  <p className="font-medium">{selectedDetail.tenantName}</p>
                  <p className="text-sm text-muted-foreground">{selectedDetail.tenantEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{selectedDetail.checkInDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{selectedDetail.checkOutDate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Desglose de Precios</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base ({selectedDetail.totalNights} noches)</span>
                    <span>${selectedDetail.baseTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa de limpieza</span>
                    <span>${selectedDetail.cleaningFee?.toFixed(2)}</span>
                  </div>
                  {selectedDetail.longStayDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento larga estadía</span>
                      <span>-${selectedDetail.longStayDiscount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${selectedDetail.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {(selectedDetail.reservationStatus === "ACTIVE" ||
                  selectedDetail.reservationStatus === "RESERVED") && (
                  <div className="flex gap-2">
                      {selectedDetail.reservationStatus === "ACTIVE" && (
                          <Button className="flex-1 bg-primary">
                              Completar Reserva
                          </Button>
                      )}

                      <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                              setIsModalOpen(false)
                              handleOpenCancelDialog(selectedDetail.id)
                          }}
                      >
                          Cancelar Reserva
                      </Button>
                  </div>
              )}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No se pudo cargar la información.</p>
          )}
        </DialogContent>
      </Dialog>
        {/* Cancel Reservation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar Reserva</DialogTitle>
                    <DialogDescription>
                        Esta cancelación será realizada por el propietario. El tenant recibirá
                        el reembolso correspondiente según la política del sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div className="w-full">
                                <h4 className="font-semibold text-amber-800">
                                    Resumen de Cancelación
                                </h4>

                                {isLoadingCancellationPreview ? (
                                    <p className="mt-2 text-sm text-amber-700">
                                        Cargando resumen de cancelación...
                                    </p>
                                ) : cancellationPreview ? (
                                    <div className="mt-2 text-sm text-amber-700">
                                        <p>
                                            Como la cancelación es realizada por el propietario, no se
                                            aplica penalización al tenant.
                                        </p>

                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Penalización:</span>
                                                <span className="font-medium">
                      ${cancellationPreview.cancellationPenalty.toFixed(2)}
                    </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Reembolso base:</span>
                                                <span className="font-medium">
                      ${cancellationPreview.reservationRefundAmount.toFixed(2)}
                    </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Tarifa limpieza:</span>
                                                <span className="font-medium">
                      ${cancellationPreview.cleaningFeeRefundAmount.toFixed(2)}
                    </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Depósito:</span>
                                                <span className="font-medium">
                      $
                                                    {cancellationPreview.guaranteeDepositRefundAmount.toFixed(
                                                        2,
                                                    )}
                    </span>
                                            </div>

                                            <div className="mt-2 flex justify-between border-t border-amber-200 pt-2 font-bold">
                                                <span>Total a reembolsar:</span>
                                                <span>
                      ${cancellationPreview.totalRefundAmount.toFixed(2)}
                    </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm text-amber-700">
                                        No se pudo obtener el resumen de cancelación.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {cancellationError && (
                        <p className="text-sm text-destructive">{cancellationError}</p>
                    )}

                    {(selectedReservation || selectedDetail) && (
                        <div className="rounded-lg bg-secondary p-4">
                            <h4 className="font-semibold">Reserva</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedReservation?.propertyName ?? selectedDetail?.property?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Tenant: {selectedReservation?.tenantName ?? selectedDetail?.tenantName}
                            </p>
                            <p className="mt-2 text-sm">
                                {selectedReservation?.checkInDate ?? selectedDetail?.checkInDate} -{" "}
                                {selectedReservation?.checkOutDate ?? selectedDetail?.checkOutDate}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowCancelDialog(false)}
                    >
                        Volver
                    </Button>

                    <Button
                        variant="destructive"
                        disabled={
                            isLoadingCancellationPreview ||
                            isCancellingReservation ||
                            !cancellationPreview
                        }
                        onClick={handleConfirmCancellation}
                    >
                        {isCancellingReservation ? "Cancelando..." : "Confirmar Cancelación"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
