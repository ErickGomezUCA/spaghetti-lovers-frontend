"use client";

import { useEffect, useMemo, useState } from "react";
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
  Star,
  Search,
  CalendarIcon,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { propertyService } from "@/lib/services/property.service";
import { Property, PropertyType } from "@/types/api-responses";

const propertyTypeOptions: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "Todos los tipos" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Apartamento" },
  { value: "ROOM", label: "Habitación" },
  { value: "BEACH_HOUSE", label: "Casa de Playa" },
  { value: "CABIN", label: "Cabaña" },
  { value: "VILLA", label: "Villa" },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [guestsCount, setGuestsCount] = useState("2");

  // Detail dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  // Booking dialog
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const res = await propertyService.getAll(0, 100);
        setProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesSearch =
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType =
          propertyType === "all" || property.propertyType === propertyType;
        return (
          matchesSearch && matchesType && property.propertyStatus === "ACTIVE"
        );
      }),
    [properties, searchTerm, propertyType],
  );

  const openDetail = (property: Property) => {
    setDetailProperty(property);
    setShowDetailDialog(true);
  };

  const openBooking = (property: Property) => {
    setBookingProperty(property);
    setDateRange({ from: undefined, to: undefined });
    setShowBookingDialog(true);
  };

  const calculateTotal = (property: Property) => {
    if (!dateRange.from || !dateRange.to) return null;
    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const baseTotal = property.basePricePerNight * nights;
    const discount = nights >= 28 ? baseTotal * 0.1 : 0;
    const total =
      baseTotal +
      property.cleaningFee -
      discount +
      property.securityDepositAmount;
    return { nights, baseTotal, discount, total };
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

      {/* Search Filters */}
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
                Huéspedes
              </Label>
              <Select value={guestsCount} onValueChange={setGuestsCount}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "huésped" : "huéspedes"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Cargando propiedades...
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
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
                  <div className="flex items-center gap-1 text-sm">
                    {/* TODO: Implement landlord rating from ratings endpoint */}
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>TODO</span>
                  </div>
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
                <Button className="flex-1" onClick={() => openBooking(property)}>
                  Reservar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredProperties.length === 0 && (
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

      {/* Detail Dialog — single instance outside the map */}
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
                      {/* TODO: Fetch landlord name from GET /users/{landlordId} */}
                      <span className="font-medium">TODO</span>
                      <span className="flex items-center gap-1 text-sm">
                        {/* TODO: Fetch landlord rating from ratings endpoint */}
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        TODO
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

      {/* Booking Dialog — single instance outside the map */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Reserva</DialogTitle>
            <DialogDescription>{bookingProperty?.title}</DialogDescription>
          </DialogHeader>
          {bookingProperty && (
            <div className="grid gap-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fechas de Estadía
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1 w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM", { locale: es })}{" "}
                            -{" "}
                            {format(dateRange.to, "dd MMM yyyy", {
                              locale: es,
                            })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: es })
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
                      onSelect={(range) =>
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Número de Huéspedes
                </Label>
                <Select value={guestsCount} onValueChange={setGuestsCount}>
                  <SelectTrigger className="mt-1">
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
                <Select defaultValue="card">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      Tarjeta de Crédito/Débito
                    </SelectItem>
                    <SelectItem value="transfer">
                      Transferencia Bancaria
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      Depósito Bancario
                    </SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange.from && dateRange.to && (
                <div className="rounded-lg bg-secondary p-4">
                  <h4 className="font-semibold">Resumen de Precio</h4>
                  {(() => {
                    const calc = calculateTotal(bookingProperty);
                    if (!calc) return null;
                    return (
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>
                            ${bookingProperty.basePricePerNight} x {calc.nights}{" "}
                            noches
                          </span>
                          <span>${calc.baseTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarifa de limpieza</span>
                          <span>
                            ${bookingProperty.cleaningFee.toFixed(2)}
                          </span>
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
                        <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
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

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Política de Cancelación:</strong> Cancelación gratuita
                  hasta 7 días antes del check-in. Entre 3-7 días: 50% de
                  penalización. Menos de 3 días: sin reembolso.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancelar
            </Button>
            {/* TODO: Wire to POST /reservations endpoint */}
            <Button disabled={!dateRange.from || !dateRange.to}>
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
