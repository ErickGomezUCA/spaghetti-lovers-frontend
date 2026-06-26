"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bed,
  Bath,
  Users,
  MapPin,
  Search,
  CalendarIcon,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { propertyService } from "@/lib/services/property.service";
import { userService } from "@/lib/services/user.service";
import { reservationService } from "@/lib/services/reservation.service";
import { Property, PropertyType } from "@/types/api-responses";

const propertyTypeOptions: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "Todos los tipos" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Apartamento" },
  { value: "ROOM", label: "Habitación" },
  { value: "STUDIO", label: "Estudio" },
  { value: "VILLA", label: "Villa" },
  { value: "CABIN", label: "Cabaña" },
  { value: "BEACH_HOUSE", label: "Casa de Playa" },
  { value: "COUNTRY_HOUSE", label: "Casa de Campo" },
  { value: "LOFT", label: "Loft" },
  { value: "CONDOMINIUM", label: "Condominio" },
  { value: "HOSTEL", label: "Hostal" },
  { value: "HOTEL", label: "Hotel" },
  { value: "DUPLEX", label: "Dúplex" },
  { value: "PENTHOUSE", label: "Penthouse" },
];

const errorTranslations: Record<string, string> = {
  "Check-out date must be after check-in date.": "La fecha de salida debe ser posterior a la fecha de entrada.",
  "You already have an active reservation during these dates.": "Ya tienes una reserva activa durante estas fechas.",
  "The property is already booked for these dates.": "Lo sentimos, la propiedad ya está reservada para estas fechas.",
  "Property is not available for new reservations.": "La propiedad no está disponible para nuevas reservas en este momento.",
  "Payment method cannot be PENDING for new reservations.": "Debes seleccionar un método de pago válido."
};

const translateApiError = (englishErrorMsg: string) => {
  if (!englishErrorMsg) return "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";
  return errorTranslations[englishErrorMsg] || englishErrorMsg; 
};

export default function PropertiesPage() {
  const router = useRouter();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [guestsCount, setGuestsCount] = useState(1);

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [detailLandlordName, setDetailLandlordName] = useState<string | null>(null);

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [bookingGuests, setBookingGuests] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 600);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await propertyService.getAll(0, 100, {
        term: debouncedTerm || undefined,
        propertyType: propertyType !== "all" ? propertyType : undefined,
        minGuests: guestsCount,
        status: "ACTIVE",
      });
      setProperties(res.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedTerm, propertyType, guestsCount]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const openDetail = (property: Property) => {
    setDetailProperty(property);
    setDetailLandlordName(null);
    setShowDetailDialog(true);
    userService.getUserById(property.landlordId)
      .then((res) => setDetailLandlordName(res.data.name))
      .catch(() => {});
  };

  const openBooking = (property: Property) => {
    setBookingProperty(property);
    setDateRange({ from: undefined, to: undefined });
    setBookingGuests("1");
    setPaymentMethod("CARD");
    setBookingError(null); 
    setShowBookingDialog(true);
  };

  const calculateTotal = (property: Property) => {
    if (!dateRange.from || !dateRange.to) return null;
    
    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    
    if (nights <= 0) return null;

    const baseTotal = property.basePricePerNight * nights;
    const discount = nights >= 28 ? baseTotal * 0.1 : 0;
    const total =
      baseTotal +
      property.cleaningFee -
      discount +
      property.securityDepositAmount;
    return { nights, baseTotal, discount, total };
  };

  const handleConfirmBooking = async () => {
    if (!bookingProperty || !dateRange.from || !dateRange.to) return;
    
    setBookingError(null);
    setIsBooking(true);
    try {
      const checkInDate = format(dateRange.from, 'yyyy-MM-dd');
      const checkOutDate = format(dateRange.to, 'yyyy-MM-dd');

      await reservationService.createReservation({
        propertyId: bookingProperty.id,
        checkInDate,
        checkOutDate,
        guestsCount: parseInt(bookingGuests),
        paymentMethod: paymentMethod 
      });

      setShowBookingDialog(false);
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error("Error al crear la reserva:", error);
      const translatedMsg = translateApiError(error.message);
      setBookingError(translatedMsg);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Buscar Propiedades
        </h1>
        <p className="text-muted-foreground">
          Encuentra tu próximo hogar temporal
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Buscar
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ciudad, departamento o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tipo de Propiedad
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Huéspedes mínimos
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setGuestsCount((g) => Math.max(1, g - 1))}
                  disabled={guestsCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {guestsCount === 10 ? "10+" : guestsCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setGuestsCount((g) => Math.min(10, g + 1))}
                  disabled={guestsCount >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Cargando propiedades...
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] min-h-48 bg-muted">
                <img
                  src={
                    property.photoUrls[0] ??
                    "/placeholder.svg?height=400&width=600"
                  }
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute right-3 top-3 bg-card text-foreground">
                  ${property.basePricePerNight}/noche
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{property.title}</CardTitle>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.city}, {property.department}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {property.maxGuests}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-4 w-4" /> {property.areaSqm}m²
                  </span>
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => openDetail(property)}
                >
                  Ver Detalles
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => openBooking(property)}
                >
                  Reservar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && properties.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">
              No se encontraron propiedades
            </h3>
            <p className="text-muted-foreground">
              Intenta con otros filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailProperty?.title}</DialogTitle>
            <DialogDescription>
              {detailProperty?.city}, {detailProperty?.department}
            </DialogDescription>
          </DialogHeader>
          {detailProperty && (
            <div className="grid gap-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={
                    detailProperty.photoUrls[0] ??
                    "/placeholder.svg?height=400&width=600"
                  }
                  alt={detailProperty.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-2 text-sm">
                <p>{detailProperty.description}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" /> {detailProperty.bedrooms}{" "}
                    habitaciones
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" /> {detailProperty.bathrooms}{" "}
                    baños
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Máx.{" "}
                    {detailProperty.maxGuests} huéspedes
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-4 w-4" /> {detailProperty.areaSqm}
                    m²
                  </span>
                </div>
                <div className="mt-4 rounded-lg bg-secondary p-4">
                  <h4 className="font-semibold">Reglas de la propiedad</h4>
                  <p className="mt-1 text-muted-foreground">
                    {detailProperty.rules}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Propietario</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {detailLandlordName ?? "Cargando..."}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${detailProperty.basePricePerNight}
                    </p>
                    <p className="text-xs text-muted-foreground">por noche</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                if (detailProperty) {
                  setShowDetailDialog(false);
                  openBooking(detailProperty);
                }
              }}
            >
              Reservar Ahora <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBookingDialog} onOpenChange={(open) => {
        setShowBookingDialog(open);
        if (!open) {
           setDateRange({ from: undefined, to: undefined });
           setBookingError(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Reserva</DialogTitle>
            <DialogDescription>{bookingProperty?.title}</DialogDescription>
          </DialogHeader>
          
          {bookingError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{bookingError}</p>
            </div>
          )}

          {bookingProperty && (
            <div className="grid gap-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fechas de Estadía
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1 w-full justify-start text-left font-normal h-11",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() ? (
                          <>
                            {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                            {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: es }) + " (Selecciona salida)"
                        )
                      ) : (
                        "Selecciona fechas"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        setBookingError(null); 
                        if (range?.from && range?.to && range.from.getTime() === range.to.getTime()) {
                          setDateRange({ from: range.from, to: undefined });
                          return;
                        }
                        setDateRange({ from: range?.from, to: range?.to });
                        if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
                          setIsCalendarOpen(false);
                        }
                      }}
                      numberOfMonths={2}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Número de Huéspedes
                </Label>
                <Select value={bookingGuests} onValueChange={(val) => { setBookingGuests(val); setBookingError(null); }}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: bookingProperty.maxGuests },
                      (_, i) => i + 1,
                    ).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "huésped" : "huéspedes"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Método de Pago
                </Label>
                <Select value={paymentMethod} onValueChange={(val) => { setPaymentMethod(val); setBookingError(null); }}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia Bancaria</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange.from && dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && (
                <div className="rounded-xl bg-secondary/50 p-4">
                  <h4 className="font-semibold mb-3">Resumen de Precio</h4>
                  {(() => {
                    const calc = calculateTotal(bookingProperty);
                    if (!calc) return null;
                    return (
                      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>
                            ${bookingProperty.basePricePerNight} x {calc.nights}{" "}
                            noches
                          </span>
                          <span>${calc.baseTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarifa de limpieza</span>
                          <span>${bookingProperty.cleaningFee.toFixed(2)}</span>
                        </div>
                        {calc.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Descuento estadía larga (10%)</span>
                            <span>-${calc.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Depósito de garantía (reembolsable)</span>
                          <span>
                            ${bookingProperty.securityDepositAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-border pt-3 font-bold text-base text-foreground">
                          <span>Total</span>
                          <span className="text-primary">
                            ${calc.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="rounded-xl border border-amber-200 bg-[#FFFBF0] p-4 mt-2">
                <p className="text-xs text-amber-800">
                  <strong className="text-amber-900">Política de Cancelación:</strong> Cancelación gratuita
                  hasta 7 días antes del check-in. Entre 3-7 días: 50% de
                  penalización. Menos de 3 días: sin reembolso.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setShowBookingDialog(false)}
              disabled={isBooking}
            >
              Cancelar
            </Button>
            <Button 
              className="h-11"
              disabled={!dateRange.from || !dateRange.to || isBooking || dateRange.from.getTime() === dateRange.to.getTime()}
              onClick={handleConfirmBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
         <DialogContent className="max-w-sm sm:max-w-[425px]">
           <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
             <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
               <CheckCircle2 className="h-6 w-6 text-green-600" />
             </div>
             <DialogTitle className="text-xl">¡Reserva Creada!</DialogTitle>
             <DialogDescription className="text-base text-center">
               Tu reserva para <strong>{bookingProperty?.title}</strong> ha sido creada y se encuentra en estado <strong>RESERVADA</strong>. Puedes gestionarla desde tu panel de reservas.
             </DialogDescription>
             <Button 
               className="w-full mt-4 h-11" 
               onClick={() => {
                 setShowSuccessDialog(false);
                 router.push("/tenant/reservas");
               }}
             >
               Entendido
             </Button>
           </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}