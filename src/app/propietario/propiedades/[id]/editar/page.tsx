"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, MapPin, DollarSign, Home, Settings } from "lucide-react";
import { propertyService } from "@/lib/services/property.service";
import { PropertyStatus, PropertyType } from "@/types/api-responses";

const propertyTypes: { value: PropertyType; label: string }[] = [
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

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
  { value: "ACTIVE", label: "Activa" },
  { value: "UNAVAILABLE", label: "No disponible" },
];

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "" as PropertyType | "",
    propertyStatus: "" as PropertyStatus | "",
    address: "",
    city: "",
    department: "",
    country: "",
    basePricePerNight: "",
    cleaningFee: "",
    securityDepositAmount: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    areaSqm: "",
    rules: "",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const res = await propertyService.getById(id);
        const p = res.data;
        setFormData({
          title: p.title,
          description: p.description ?? "",
          propertyType: p.propertyType,
          propertyStatus: p.propertyStatus,
          address: p.address,
          city: p.city,
          department: p.department,
          country: p.country,
          basePricePerNight: String(p.basePricePerNight),
          cleaningFee: String(p.cleaningFee),
          securityDepositAmount: String(p.securityDepositAmount),
          maxGuests: String(p.maxGuests),
          bedrooms: String(p.bedrooms),
          bathrooms: String(p.bathrooms),
          areaSqm: String(p.areaSqm),
          rules: p.rules ?? "",
        });
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await propertyService.update(id, {
        title: formData.title || undefined,
        description: formData.description || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        department: formData.department || undefined,
        country: formData.country || undefined,
        basePricePerNight: formData.basePricePerNight
          ? parseFloat(formData.basePricePerNight)
          : undefined,
        cleaningFee: formData.cleaningFee
          ? parseFloat(formData.cleaningFee)
          : undefined,
        securityDepositAmount: formData.securityDepositAmount
          ? parseFloat(formData.securityDepositAmount)
          : undefined,
        maxGuests: formData.maxGuests
          ? parseInt(formData.maxGuests)
          : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms
          ? parseInt(formData.bathrooms)
          : undefined,
        areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : undefined,
        propertyType: (formData.propertyType as PropertyType) || undefined,
        propertyStatus: (formData.propertyStatus as PropertyStatus) || undefined,
        rules: formData.rules || undefined,
      });
      router.push(`/propietario/propiedades/${id}`);
    } catch (err) {
      console.error("Error updating property:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Cargando propiedad...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/propietario/propiedades/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Editar Propiedad
          </h1>
          <p className="text-muted-foreground">
            Actualiza la información de tu propiedad
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="w-5 h-5 text-primary" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Título de la Propiedad
                </Label>
                <Input
                  placeholder="Ej. Apartamento con vista al mar"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Tipo de Propiedad
                </Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    handleInputChange("propertyType", value)
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Descripción
              </Label>
              <Textarea
                placeholder="Describe tu propiedad..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="bg-input"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Habitaciones
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Baños
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Huéspedes Máx.
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) =>
                    handleInputChange("maxGuests", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Área (m²)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.areaSqm}
                  onChange={(e) =>
                    handleInputChange("areaSqm", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Estado de la Propiedad
              </Label>
              <Select
                value={formData.propertyStatus}
                onValueChange={(value) =>
                  handleInputChange("propertyStatus", value)
                }
              >
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {propertyStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El estado RESERVADA es asignado automáticamente por el sistema.
              </p>
            </div>
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Dirección
              </Label>
              <Input
                placeholder="Calle, número, colonia"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Ciudad
                </Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Departamento
                </Label>
                <Input
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  País
                </Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="bg-input"
                />
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Precio por Noche (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePricePerNight}
                  onChange={(e) =>
                    handleInputChange("basePricePerNight", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Tarifa de Limpieza (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaningFee}
                  onChange={(e) =>
                    handleInputChange("cleaningFee", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Depósito de Garantía (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.securityDepositAmount}
                  onChange={(e) =>
                    handleInputChange("securityDepositAmount", e.target.value)
                  }
                  className="bg-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Reglas de la Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Reglas y Políticas
              </Label>
              <Textarea
                placeholder="Describe las reglas de tu propiedad..."
                rows={6}
                value={formData.rules}
                onChange={(e) => handleInputChange("rules", e.target.value)}
                className="bg-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/propietario/propiedades/${id}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
