"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Building2,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { propertyService } from "@/lib/services/property.service";
import { userService } from "@/lib/services/user.service";
import { Property, PropertyStatus, PropertyType } from "@/types/api-responses";

const statusConfig: Record<
  PropertyStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  ACTIVE: { label: "Activa", color: "bg-green-100 text-green-700", icon: CheckCircle },
  RESERVED: { label: "Reservada", color: "bg-blue-100 text-blue-700", icon: Calendar },
  UNAVAILABLE: { label: "No disponible", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
};

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

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [landlordNames, setLandlordNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const res = await propertyService.getAll(0, 100);
        setProperties(res.data);

        const uniqueIds = [...new Set(res.data.map((p) => p.landlordId))];
        const results = await Promise.allSettled(
          uniqueIds.map((id) => userService.getUserById(id))
        );
        const names: Record<string, string> = {};
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            names[uniqueIds[i]] = result.value.data.name;
          }
        });
        setLandlordNames(names);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.propertyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.propertyStatus === "ACTIVE").length,
    reserved: properties.filter((p) => p.propertyStatus === "RESERVED").length,
    unavailable: properties.filter((p) => p.propertyStatus === "UNAVAILABLE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Propiedades del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Supervision de todas las propiedades registradas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Propiedades
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.reserved}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No disponibles</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.unavailable}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
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
                placeholder="Buscar por titulo o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all"
                    ? "Todos los estados"
                    : statusConfig[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                  Activas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("RESERVED")}>
                  Reservadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("UNAVAILABLE")}>
                  No disponibles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Cargando propiedades...
        </div>
      )}

      {/* Properties List */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Lista de Propiedades ({filteredProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProperties.map((property) => {
                const status = statusConfig[property.propertyStatus];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {property.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {propertyTypeLabels[property.propertyType]}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground ml-13">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.address}, {property.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {landlordNames[property.landlordId] ?? "Cargando..."}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${property.basePricePerNight}/noche
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
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
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/propiedades/${property.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

              {filteredProperties.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron propiedades</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
