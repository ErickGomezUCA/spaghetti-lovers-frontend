"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MapPin,
  Bed,
  Bath,
  Users,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/contexts/auth-context";
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

const statusColors: Record<PropertyStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  RESERVED: "bg-blue-100 text-blue-700 border-blue-200",
  UNAVAILABLE: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<PropertyStatus, string> = {
  ACTIVE: "Activa",
  RESERVED: "Reservada",
  UNAVAILABLE: "No disponible",
};

export default function PropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const res = await propertyService.getByLandlord(user.id);
        setProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [user]);

  const handleDelete = async (id: string) => {
    // TODO: add confirmation dialog before deleting
    try {
      await propertyService.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting property:", err);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.propertyStatus === statusFilter;
    const matchesType =
      typeFilter === "all" || property.propertyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Mis Propiedades
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus propiedades en alquiler
          </p>
        </div>
        <Link href="/propietario/propiedades/nueva">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
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
                <SelectItem value="ACTIVE">Activa</SelectItem>
                <SelectItem value="RESERVED">Reservada</SelectItem>
                <SelectItem value="UNAVAILABLE">No disponible</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {(
                  Object.entries(propertyTypeLabels) as [
                    PropertyType,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Cargando propiedades...
        </div>
      )}

      {/* Properties Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-shadow"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-muted">
                <img
                  src={
                    property.photoUrls[0] ??
                    "/placeholder.svg?height=200&width=300"
                  }
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-3 left-3 ${statusColors[property.propertyStatus]}`}
                >
                  {statusLabels[property.propertyStatus]}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/propietario/propiedades/${property.id}`,
                        )
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" /> Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/propietario/propiedades/${property.id}/editar`,
                        )
                      }
                    >
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {/* TODO: Navigate to calendar for this property */}
                      <Calendar className="w-4 h-4 mr-2" /> Ver calendario
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {propertyTypeLabels[property.propertyType]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        {/* TODO: Implement property rating from ratings endpoint */}
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">TODO</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mt-2">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {property.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" /> {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {property.maxGuests}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-xl font-semibold text-primary">
                        ${property.basePricePerNight}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /noche
                      </span>
                    </div>
                    {/* TODO: Fetch reservation count from reservations endpoint */}
                    <span className="text-xs text-muted-foreground">
                      TODO reservas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProperties.length === 0 && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {properties.length === 0
                ? "Aún no tienes propiedades registradas. ¡Crea tu primera propiedad!"
                : "No hay propiedades que coincidan con los filtros seleccionados."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
