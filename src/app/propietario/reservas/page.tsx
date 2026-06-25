"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
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
  AlertTriangle
} from "lucide-react"

type LandlordReservation = {
    id: string
    property: string
    tenant: string
    tenantEmail: string
    checkIn: string
    checkOut: string
    guests: number
    totalNights: number
    baseTotal: number
    cleaningFee: number
    securityDeposit: number
    longStayDiscount: number
    totalPrice: number
    status: "reserved" | "active" | "completed" | "cancelled"
    paymentMethod: string
    createdAt: string
    cancelledAt?: string
    cancellationPenalty?: number
}

// Mock data
const mockLandlordReservations: LandlordReservation[] =  [
  {
    id: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    tenantEmail: "maria@email.com",
    checkIn: "2024-06-15",
    checkOut: "2024-06-20",
    guests: 2,
    totalNights: 5,
    baseTotal: 425,
    cleaningFee: 50,
    securityDeposit: 100,
    longStayDiscount: 0,
    totalPrice: 575,
    status: "active",
    paymentMethod: "card",
    createdAt: "2024-06-10",
  },
  {
    id: "14a4cfba-a876-4cf4-a04a-4f1fa9cc33d4",
    property: "Casa de Playa Costa del Sol",
    tenant: "Carlos López",
    tenantEmail: "carlos@email.com",
    checkIn: "2024-06-27",
    checkOut: "2024-06-29",
    guests: 6,
    totalNights: 7,
    baseTotal: 1050,
    cleaningFee: 75,
    securityDeposit: 200,
    longStayDiscount: 0,
    totalPrice: 1325,
    status: "reserved",
    paymentMethod: "transfer",
    createdAt: "2024-06-08",
  },
  {
    id: "RES-003",
    property: "Loft Moderno Zona Rosa",
    tenant: "Ana Martínez",
    tenantEmail: "ana@email.com",
    checkIn: "2024-05-01",
    checkOut: "2024-05-30",
    guests: 2,
    totalNights: 29,
    baseTotal: 1885,
    cleaningFee: 40,
    securityDeposit: 80,
    longStayDiscount: 188.5,
    totalPrice: 1816.5,
    status: "completed",
    paymentMethod: "card",
    createdAt: "2024-04-20",
  },
  {
    id: "RES-004",
    property: "Cabaña en la Montaña",
    tenant: "Pedro Sánchez",
    tenantEmail: "pedro@email.com",
    checkIn: "2024-06-01",
    checkOut: "2024-06-05",
    guests: 4,
    totalNights: 4,
    baseTotal: 380,
    cleaningFee: 60,
    securityDeposit: 120,
    longStayDiscount: 0,
    totalPrice: 560,
    status: "cancelled",
    paymentMethod: "bank_transfer",
    createdAt: "2024-05-25",
    cancelledAt: "2024-05-28",
    cancellationPenalty: 190,
  },
]

const statusColors: Record<string, string> = {
  reserved: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  reserved: "Reservada",
  active: "Activa",
  completed: "Completada",
  cancelled: "Cancelada",
}

const statusIcons: Record<string, React.ReactNode> = {
  reserved: <Clock className="w-4 h-4" />,
  active: <CheckCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
}

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] =
      useState<LandlordReservation | null>(null)
  const [landlordReservations, setLandlordReservations] =
      useState<LandlordReservation[]>(mockLandlordReservations)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellationPreview, setCancellationPreview] =
      useState<ReservationCancellationPreviewResponse | null>(null)
  const [isLoadingCancellationPreview, setIsLoadingCancellationPreview] =
      useState(false)
  const [isCancellingReservation, setIsCancellingReservation] = useState(false)
  const [cancellationError, setCancellationError] = useState<string | null>(null)

  const filteredReservations = landlordReservations.filter((reservation) => {
    const matchesSearch =
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.tenant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

    const handleOpenCancelDialog = async (
        reservation: (typeof mockLandlordReservations)[0],
    ) => {
        setSelectedReservation(reservation)
        setShowCancelDialog(true)
        setCancellationPreview(null)
        setCancellationError(null)
        setIsLoadingCancellationPreview(true)

        try {
            const response = await reservationService.previewCancellation(reservation.id)
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

          setLandlordReservations((prev) =>
              prev.map((reservation) =>
                  reservation.id === response.data.reservationId
                      ? {
                          ...reservation,
                          status: "cancelled",
                          cancellationPenalty: response.data.cancellationPenalty,
                      }
                      : reservation,
              ),
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
                placeholder="Buscar por ID, propiedad o inquilino..."
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
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
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
                {landlordReservations.filter((r) => r.status === "reserved").length}
            </p>
            <p className="text-sm text-muted-foreground">Reservadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
                {landlordReservations.filter((r) => r.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-600">
                {landlordReservations.filter((r) => r.status === "completed").length}
            </p>
            <p className="text-sm text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">
                {landlordReservations.filter((r) => r.status === "cancelled").length}
            </p>
            <p className="text-sm text-muted-foreground">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{reservation.property}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.tenant}</p>
                      <p className="text-xs text-muted-foreground">{reservation.tenantEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{reservation.checkIn}</span>
                      <span>→</span>
                      <span>{reservation.checkOut}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{reservation.totalNights} noches</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {reservation.guests}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {reservation.totalPrice.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[reservation.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[reservation.status]}
                        {statusLabels[reservation.status]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalle de Reserva {reservation.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Propiedad</p>
                                <p className="font-medium">{reservation.property}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Inquilino</p>
                                <p className="font-medium">{reservation.tenant}</p>
                                <p className="text-sm text-muted-foreground">{reservation.tenantEmail}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Check-in</p>
                                <p className="font-medium">{reservation.checkIn}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Check-out</p>
                                <p className="font-medium">{reservation.checkOut}</p>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Desglose de Precios</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Base ({reservation.totalNights} noches)</span>
                                  <span>${reservation.baseTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tarifa de limpieza</span>
                                  <span>${reservation.cleaningFee.toFixed(2)}</span>
                                </div>
                                {reservation.longStayDiscount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Descuento larga estadía (10%)</span>
                                    <span>-${reservation.longStayDiscount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Depósito de garantía</span>
                                  <span>${reservation.securityDeposit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-2">
                                  <span>Total</span>
                                  <span>${reservation.totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            {(reservation.status === "active" || reservation.status === "reserved") && (
                                <div className="flex gap-2">
                                    {reservation.status === "active" && (
                                        <Button className="flex-1 bg-primary">
                                            Completar Reserva
                                        </Button>
                                    )}

                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleOpenCancelDialog(reservation)}
                                    >
                                        Cancelar Reserva
                                    </Button>
                                </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Link href={`/propietario/contratos?reservation=${reservation.id}`}>
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
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar Reserva</DialogTitle>
                    <DialogDescription>
                        Esta cancelación será realizada por el propietario. El tenant recibirá el
                        reembolso correspondiente según la política del sistema.
                    </DialogDescription>
                </DialogHeader>

                {selectedReservation && (
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

                        <div className="rounded-lg bg-secondary p-4">
                            <h4 className="font-semibold">Reserva</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedReservation.property}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Tenant: {selectedReservation.tenant}
                            </p>
                            <p className="mt-2 text-sm">
                                {selectedReservation.checkIn} - {selectedReservation.checkOut}
                            </p>
                        </div>
                    </div>
                )}

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
