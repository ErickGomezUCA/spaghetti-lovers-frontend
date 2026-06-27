"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reservationService } from "@/lib/services/reservation.service";
import { ReservationCancellationPreviewResponse } from "@/types/api-responses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Key,
  FileText,
  ChevronRight,
  CalendarIcon,
  AlertTriangle,
  Star,
  Home,
  Image as ImageIcon,
  Loader2,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {format} from "date-fns";
import { es } from "date-fns/locale";
import { ReservationResponse, ReservationDetailResponse } from "@/types/api-responses";

const statusColors: Record<string, string> = {
  RESERVED: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  RESERVED: "Reservada",
  ACTIVE: "En Curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const errorTranslations: Record<string, string> = {
  "The property is not available for the requested extension dates.": "La propiedad no está disponible para las fechas solicitadas. Probablemente ya fue reservada por otra persona.",
  "The new check-out date must be after the current check-out date.": "La nueva fecha de salida debe ser posterior a la actual.",
  "Only RESERVED or ACTIVE reservations can be extended.": "Solo puedes extender reservas activas o en estado reservado.",
  "A valid payment method is required. 'PENDING' is not allowed for extensions.": "Debes seleccionar un método de pago válido."
};

const translateApiError = (englishErrorMsg: string) => {
  if (!englishErrorMsg) return "Ha ocurrido un error inesperado al extender la reserva. Por favor, intenta de nuevo.";
  return errorTranslations[englishErrorMsg] || englishErrorMsg;
};

const formatShortDateCard = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const monthStr = date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  return `${day} ${monthStr} ${year}`;
};

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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<ReservationDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date | undefined>();
  const [extendPaymentMethod, setExtendPaymentMethod] = useState("CARD");
  const [extendError, setExtendError] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [showExtendSuccess, setShowExtendSuccess] = useState(false);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationPreview, setCancellationPreview] =
      useState<ReservationCancellationPreviewResponse | null>(null);
  const [isLoadingCancellationPreview, setIsLoadingCancellationPreview] =
      useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);

  const router = useRouter();

  const handleRateReservation = (
    reservation: ReservationResponse
  ) => {
    router.push(
      `/tenant/calificaciones?reservationId=${reservation.id}`
    );
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res = await reservationService.getMyReservations(0, 50);
      setReservations(res.data || []);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const activeReservations = reservations.filter(
    (r) => r.reservationStatus === "ACTIVE" || r.reservationStatus === "RESERVED"
  );
  const completedReservations = reservations.filter(
    (r) => r.reservationStatus === "COMPLETED"
  );
  const cancelledReservations = reservations.filter(
    (r) => r.reservationStatus === "CANCELLED"
  );

  const handleViewDetails = async (reservation: ReservationResponse) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
    setIsDetailLoading(true);

    try {
      const res = await reservationService.getLandlordReservationDetail(reservation.id);
      setSelectedDetail(res.data);
    } catch (error) {
      console.error("Error cargando el detalle completo:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenExtend = async (reservation: ReservationResponse) => {
    setSelectedReservation(reservation);
    setNewCheckoutDate(undefined);
    setExtendError(null);
    setExtendPaymentMethod("CARD");
    setShowExtendDialog(true);
    setIsDetailLoading(true);
    try {
      const res = await reservationService.getLandlordReservationDetail(reservation.id);
      setSelectedDetail(res.data);
    } catch (error) {
      console.error("Error cargando detalle para extensión:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleConfirmExtension = async () => {
      if (!selectedReservation || !newCheckoutDate) return;

      setExtendError(null);
      setIsExtending(true);

      try {
          const formattedNewDate = format(newCheckoutDate, 'yyyy-MM-dd');

          await reservationService.extendReservation(selectedReservation.id, {
              newCheckOutDate: formattedNewDate,
              paymentMethod: extendPaymentMethod
          });

          setShowExtendDialog(false);
          setShowExtendSuccess(true);
          fetchReservations();
      } catch (error: any) {
          console.error("Error al extender:", error);
          const translatedMsg = translateApiError(error.message);
          setExtendError(translatedMsg);
      } finally {
          setIsExtending(false);
      }
  };

      const handleOpenCancelDialog = async (reservation: ReservationResponse) => {
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
      };

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

              setShowCancelDialog(false)
              setSelectedReservation(null)
              setCancellationPreview(null)

              fetchReservations()
          } catch (error) {
              console.error("Error cancelling reservation:", error)
              setCancellationError("No se pudo cancelar la reserva.")
          } finally {
              setIsCancellingReservation(false)
          }
      }

  const ReservationCard = ({ reservation }: { reservation: ReservationResponse }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="aspect-video w-full bg-muted/50 flex items-center justify-center border-r md:aspect-square md:w-56 shrink-0 overflow-hidden">
            {(reservation as any).propertyImage && !imageError ? (
              <img
                src={(reservation as any).propertyImage}
                alt={reservation.propertyName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">{reservation.propertyName}</h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <MapPin className="h-4 w-4" />
                  {(reservation as any).propertyCity && (reservation as any).propertyDepartment
                    ? `${(reservation as any).propertyCity}, ${(reservation as any).propertyDepartment}`
                    : "Ubicación no disponible"}
                </p>
              </div>
              <Badge className={cn("font-medium", statusColors[reservation.reservationStatus] || "bg-gray-100")}>
                {statusLabels[reservation.reservationStatus] || reservation.reservationStatus}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Check-in</p>
                  <p className="font-medium">{formatShortDateCard(reservation.checkInDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Check-out</p>
                  <p className="font-medium">{formatShortDateCard(reservation.checkOutDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Huéspedes</p>
                  <p className="font-medium">{reservation.guestsCount}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                  <p className="font-medium text-primary">
                    ${reservation.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(reservation)}
              >
                Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

              {(reservation.reservationStatus === "ACTIVE" || reservation.reservationStatus === "RESERVED") && (
                <>
                  <Button variant="outline" size="sm" className="bg-muted/30">
                    <Key className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Pendiente</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenExtend(reservation)}
                  >
                    Extender
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleOpenCancelDialog(reservation)}
                  >
                      Cancelar
                  </Button>
                </>
              )}

              {reservation.reservationStatus === "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={ () => handleRateReservation(reservation) }
                >
                  <Star className="mr-1 h-4 w-4"/>
                  Calificar
              </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona todas tus reservas en RentFlow
        </p>
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
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : activeReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No tienes reservas activas</h3>
                <p className="text-muted-foreground">
                  Busca propiedades para hacer tu próxima reserva
                </p>
              </CardContent>
            </Card>
          ) : (
            activeReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {isLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : completedReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">
                  No tienes reservas completadas
                </h3>
                <p className="text-muted-foreground">
                  Tus reservas pasadas aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            completedReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-4">
          {isLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : cancelledReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">
                  No tienes reservas canceladas
                </h3>
                <p className="text-muted-foreground">
                  Las reservas canceladas aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            cancelledReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);
          if (!open) setSelectedDetail(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle de Reserva</DialogTitle>
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
              <div className="rounded-xl bg-secondary/50 p-4">
                <h4 className="font-semibold text-foreground">
                  Información de la Propiedad
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedDetail.property?.address || "Dirección específica disponible al hacer check-in"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedDetail.property?.city}, {selectedDetail.property?.department}
                </p>
              </div>

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
                <h4 className="font-semibold mb-3">Desglose de Precios</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Estadía ({selectedDetail.totalNights} noches)</span>
                    <span>${selectedDetail.baseTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa de limpieza</span>
                    <span>${selectedDetail.cleaningFee?.toFixed(2) || "0.00"}</span>
                  </div>
                  {selectedDetail.longStayDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento estadía larga</span>
                      <span>-${selectedDetail.longStayDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                      <span>Depósito de garantía</span>
                      <span>${selectedDetail.securityDepositAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-3 font-bold text-base text-foreground">
                    <span>Total</span>
                    <span className="text-primary">
                      ${selectedDetail.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[#FFF6F0] p-4 border border-orange-100">
                <Key className="h-6 w-6 text-[#E46B4B]" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Código de Acceso
                  </p>
                  <p className="font-mono text-sm font-bold text-[#E46B4B]">
                    Pendiente de conexión
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent className="max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Extender Reserva</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Selecciona la nueva fecha de check-out
            </DialogDescription>
          </DialogHeader>

          {extendError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{extendError}</p>
            </div>
          )}

          {selectedReservation && (
            <div className="space-y-5 py-4">
              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fecha actual de check-out
                </Label>
                <p className="mt-1 text-[17px] font-medium text-foreground">
                  {formatFullLongDate(selectedReservation.checkOutDate)}
                </p>
              </div>

              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Nueva fecha de check-out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !newCheckoutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCheckoutDate
                        ? format(newCheckoutDate, "d 'de' MMMM yyyy", { locale: es })
                        : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={(date) => {
                         setNewCheckoutDate(date);
                         setExtendError(null);
                      }}
                      defaultMonth={new Date(selectedReservation.checkOutDate)}
                      disabled={(date) => {
                        const checkOut = new Date(selectedReservation.checkOutDate);
                        checkOut.setHours(0, 0, 0, 0);
                        date.setHours(0, 0, 0, 0);
                        return date.getTime() <= checkOut.getTime();
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Método de Pago
                </Label>
                <Select value={extendPaymentMethod} onValueChange={(v) => {setExtendPaymentMethod(v); setExtendError(null);}}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia Bancaria</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCheckoutDate && selectedDetail?.property && (
                <div className="rounded-xl bg-secondary/50 p-4">
                  <h4 className="font-semibold text-sm mb-3">Costo de Extensión</h4>
                  {(() => {
                    const currentCheckout = new Date(selectedReservation.checkOutDate);
                    currentCheckout.setHours(0,0,0,0);
                    const newCheckout = new Date(newCheckoutDate);
                    newCheckout.setHours(0,0,0,0);

                    const additionalNights = Math.round((newCheckout.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24));
                    const basePrice = selectedDetail.property.basePricePerNight || 0;
                    const totalExtension = additionalNights * basePrice;

                    return (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>${basePrice.toFixed(2)} x {additionalNights} {additionalNights === 1 ? 'noche adicional' : 'noches adicionales'}</span>
                          <span>${totalExtension.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-border pt-3 font-bold text-foreground">
                          <span>Total a pagar hoy</span>
                          <span className="text-primary">${totalExtension.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowExtendDialog(false)}
              className="h-11"
              disabled={isExtending}
            >
              Cancelar
            </Button>
            <Button
              disabled={!newCheckoutDate || isExtending}
              className="h-11"
              onClick={handleConfirmExtension}
            >
              {isExtending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Extensión"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendSuccess} onOpenChange={setShowExtendSuccess}>
         <DialogContent className="max-w-sm sm:max-w-[425px]">
           <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
             <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
               <CheckCircle2 className="h-6 w-6 text-green-600" />
             </div>
             <DialogTitle className="text-xl">¡Reserva Extendida!</DialogTitle>
             <DialogDescription className="text-base text-center">
               Tu reserva para <strong>{selectedReservation?.propertyName}</strong> ha sido extendida con éxito. Las nuevas fechas y totales ya están reflejados en tu panel.
             </DialogDescription>
             <Button
               className="w-full mt-4 h-11"
               onClick={() => {
                 setShowExtendSuccess(false);
               }}
             >
               Entendido
             </Button>
           </div>
         </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-[400px]">
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
                    <h4 className="font-semibold text-amber-800">
                      Política de Cancelación
                    </h4>
                      {isLoadingCancellationPreview ? (
                          <p className="mt-2 text-sm text-amber-700">
                              Cargando resumen de cancelación...
                          </p>
                      ) : cancellationPreview ? (
                          <div className="mt-2 text-sm text-amber-700">
                              <p>
                                  {cancellationPreview.cancellationPenalty === 0
                                      ? "Reembolso completo según la política de cancelación."
                                      : "Esta cancelación aplica penalización."}
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
          ${cancellationPreview.guaranteeDepositRefundAmount.toFixed(2)}
        </span>
                                  </div>

                                  <div className="mt-2 flex justify-between border-t border-amber-200 pt-2 font-bold">
                                      <span>Total a reembolsar:</span>
                                      <span>${cancellationPreview.totalRefundAmount.toFixed(2)}</span>
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
                    <h4 className="font-semibold">Propiedad</h4>
                    <p className="text-sm text-muted-foreground">
                        {selectedReservation.propertyName}
                    </p>
                    <p className="mt-2 text-sm">
                        {formatShortDateCard(selectedReservation.checkInDate)} -{" "}
                        {formatShortDateCard(selectedReservation.checkOutDate)}
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
  );
}
