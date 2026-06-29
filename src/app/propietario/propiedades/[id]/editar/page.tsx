"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Home,
  Settings,
  Upload,
  X,
  Image,
  Loader2,
} from "lucide-react";
import { propertyService } from "@/lib/services/property.service";
import { uploadService } from "@/lib/services/upload.service";
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
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<
    { url: string; publicId: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        setExistingPhotos(p.photoUrls ?? []);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    setIsUploading(true);
    const results = await Promise.allSettled(
      files.map((f) => uploadService.uploadImage(f)),
    );
    const uploaded: { url: string; publicId: string }[] = [];
    const errors: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        uploaded.push({
          url: result.value.data.url,
          publicId: result.value.data.publicId,
        });
      } else {
        errors.push(
          `${files[i].name}: ${(result.reason as Error)?.message ?? "Error al subir"}`,
        );
      }
    });
    setNewPhotos((prev) => [...prev, ...uploaded]);
    if (errors.length > 0) setUploadError(errors.join(", "));
    setIsUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await propertyService.update(id, {
        title: formData.title || undefined,
        description: formData.description,
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
        propertyStatus:
          (formData.propertyStatus as PropertyStatus) || undefined,
        rules: formData.rules || undefined,
      });
      if (newPhotos.length > 0) {
        await propertyService.attachPhotos(id, { photoUrls: newPhotos });
      }
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
                  onChange={(e) => handleInputChange("areaSqm", e.target.value)}
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

        {/* Photos */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="w-5 h-5 text-primary" />
              Fotos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingPhotos.map((url, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg opacity-80"
                  />
                </div>
              ))}
              {newPhotos.map((photo, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={photo.url}
                    alt={`Nueva foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewPhotos((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Agregar fotos</span>
                  </>
                )}
              </button>
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            {existingPhotos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Las fotos existentes se muestran en gris. Las nuevas fotos se
                agregarán al guardar.
              </p>
            )}
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
            disabled={isSaving || isUploading}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
