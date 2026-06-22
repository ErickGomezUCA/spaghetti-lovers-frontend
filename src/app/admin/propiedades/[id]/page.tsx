"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Users,
  Maximize2,
  DollarSign,
  Shield,
  Star,
  Calendar,
  Home,
  User,
} from "lucide-react";
import Link from "next/link";
import { propertyService } from "@/lib/services/property.service";
import { Property, PropertyStatus, PropertyType } from "@/types/api-responses";

const propertyTypeLabels: Record<PropertyType, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  ROOM: "Habitación",
  STUDIO: "Estudio",
  VILLA: "Villa",
  CABIN: "Cabaña",
  BEACH_HOUSE: "Casa de Playa",
  COUNTRY_HOUSE: "Casa de Campo",
  LOFT: "Loft",
  CONDOMINIUM: "Condominio",
  HOSTEL: "Hostal",
  HOTEL: "Hotel",
  DUPLEX: "Dúplex",
  PENTHOUSE: "Penthouse",
};

const statusConfig: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: "Activa", className: "bg-green-100 text-green-700" },
  RESERVED: { label: "Reservada", className: "bg-blue-100 text-blue-700" },
  UNAVAILABLE: {
    label: "No disponible",
    className: "bg-red-100 text-red-700",
  },
};

export default function AdminPropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const res = await propertyService.getById(id);
        setProperty(res.data);
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Cargando propiedad...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No se encontró la propiedad.
        </p>
        <Link href="/admin/propiedades">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Propiedades
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[property.propertyStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/propiedades">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {propertyTypeLabels[property.propertyType]}
              </Badge>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Photo */}
          <Card className="border-t-4 border-t-primary overflow-hidden">
            <div className="aspect-video bg-muted">
              <img
                src={
                  property.photoUrls[0] ??
                  "/placeholder.svg?height=300&width=400"
                }
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            {property.photoUrls.length > 1 && (
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-1">
                  {property.photoUrls.slice(1, 5).map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Foto ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Quick specs */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5 text-primary" />
                Especificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="w-4 h-4" /> Habitaciones
                </span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bath className="w-4 h-4" /> Baños
                </span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" /> Huéspedes máx.
                </span>
                <span className="font-medium">{property.maxGuests}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Maximize2 className="w-4 h-4" /> Área
                </span>
                <span className="font-medium">{property.areaSqm} m²</span>
              </div>
            </CardContent>
          </Card>

          {/* Landlord info */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Propietario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID</span>
                <span className="font-mono text-xs break-all text-right max-w-[60%]">
                  {property.landlordId}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nombre</span>
                {/* TODO: Fetch landlord name from GET /users/{landlordId} */}
                <span className="font-medium">TODO</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-500" /> Calificación
                </span>
                {/* TODO: Fetch average rating from ratings endpoint */}
                <span className="font-medium">TODO</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Reservas totales
                </span>
                {/* TODO: Fetch reservation count from reservations endpoint */}
                <span className="font-medium">TODO</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {property.description || "Sin descripción."}
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Dirección
                  </p>
                  <p className="font-medium mt-1">{property.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Ciudad
                  </p>
                  <p className="font-medium mt-1">{property.city}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Departamento
                  </p>
                  <p className="font-medium mt-1">{property.department}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    País
                  </p>
                  <p className="font-medium mt-1">{property.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-secondary p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Por noche
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    ${property.basePricePerNight}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Limpieza
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    ${property.cleaningFee}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground font-medium">
                    Depósito
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    ${property.securityDepositAmount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Reglas de la Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.rules || "Sin reglas definidas."}
              </p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border-t-4 border-t-primary">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div>
                  <span className="text-xs uppercase font-medium">
                    Publicada
                  </span>
                  <p className="mt-1">
                    {new Date(property.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-medium">
                    Última actualización
                  </span>
                  <p className="mt-1">
                    {new Date(property.updatedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
