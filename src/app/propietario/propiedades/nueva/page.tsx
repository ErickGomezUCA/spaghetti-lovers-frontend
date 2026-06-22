"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  X,
  MapPin,
  DollarSign,
  Home,
  Image,
  Loader2,
} from "lucide-react";
import { propertyService } from "@/lib/services/property.service";
import { uploadService } from "@/lib/services/upload.service";
import { PhotoEntry } from "@/lib/services/property.dto";
import { PropertyType } from "@/types/api-responses";

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

type UploadedPhoto = PhotoEntry & { previewUrl: string };

export default function NewPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "" as PropertyType | "",
    address: "",
    city: "",
    department: "",
    country: "El Salvador",
    basePricePerNight: "",
    cleaningFee: "",
    securityDepositAmount: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    areaSqm: "",
    rules: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const results = await Promise.allSettled(
      files.map((file) => uploadService.uploadImage(file)),
    );

    const uploaded: UploadedPhoto[] = [];
    const errors: string[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        uploaded.push({
          url: result.value.data.url,
          publicId: result.value.data.publicId,
          previewUrl: result.value.data.url,
        });
      } else {
        errors.push(`${files[i].name}: ${(result.reason as Error)?.message ?? "Error al subir"}`);
      }
    });

    setPhotos((prev) => [...prev, ...uploaded]);
    if (errors.length > 0) setUploadError(errors.join(", "));
    setIsUploading(false);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.propertyType) return;

    setIsLoading(true);
    try {
      const created = await propertyService.create({
        title: formData.title,
        description: formData.description || undefined,
        address: formData.address,
        city: formData.city,
        department: formData.department,
        country: formData.country,
        basePricePerNight: parseFloat(formData.basePricePerNight),
        cleaningFee: parseFloat(formData.cleaningFee),
        securityDepositAmount: parseFloat(formData.securityDepositAmount),
        maxGuests: parseInt(formData.maxGuests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        areaSqm: parseFloat(formData.areaSqm),
        propertyType: formData.propertyType,
        rules: formData.rules || undefined,
      });

      if (photos.length > 0) {
        await propertyService.attachPhotos(created.data.id, {
          photoUrls: photos.map(({ url, publicId }) => ({ url, publicId })),
        });
      }

      router.push("/propietario/propiedades");
    } catch (err) {
      console.error("Error creating property:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/propietario/propiedades">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Nueva Propiedad
          </h1>
          <p className="text-muted-foreground">
            Registra una nueva propiedad para alquilar
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
                <Label
                  htmlFor="title"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Título de la Propiedad
                </Label>
                <Input
                  id="title"
                  placeholder="Ej. Apartamento con vista al mar"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="propertyType"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
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
              <Label
                htmlFor="description"
                className="text-xs uppercase text-muted-foreground font-medium"
              >
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe tu propiedad, sus características y lo que la hace especial..."
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
                <Label
                  htmlFor="bedrooms"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Habitaciones
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="bathrooms"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Baños
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="maxGuests"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Huéspedes Máx.
                </Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.maxGuests}
                  onChange={(e) =>
                    handleInputChange("maxGuests", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="areaSqm"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Área (m²)
                </Label>
                <Input
                  id="areaSqm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.areaSqm}
                  onChange={(e) =>
                    handleInputChange("areaSqm", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
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
              <Label
                htmlFor="address"
                className="text-xs uppercase text-muted-foreground font-medium"
              >
                Dirección
              </Label>
              <Input
                id="address"
                placeholder="Calle, número, colonia"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-input"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Ciudad
                </Label>
                <Input
                  id="city"
                  placeholder="San Salvador"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Departamento
                </Label>
                <Input
                  id="department"
                  placeholder="San Salvador"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  País
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="bg-input"
                  required
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
                <Label
                  htmlFor="basePricePerNight"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Precio por Noche (USD)
                </Label>
                <Input
                  id="basePricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.basePricePerNight}
                  onChange={(e) =>
                    handleInputChange("basePricePerNight", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="cleaningFee"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Tarifa de Limpieza (USD)
                </Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cleaningFee}
                  onChange={(e) =>
                    handleInputChange("cleaningFee", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="securityDepositAmount"
                  className="text-xs uppercase text-muted-foreground font-medium"
                >
                  Depósito de Garantía (USD)
                </Label>
                <Input
                  id="securityDepositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.securityDepositAmount}
                  onChange={(e) =>
                    handleInputChange("securityDepositAmount", e.target.value)
                  }
                  className="bg-input"
                  required
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              * Se aplica un descuento del 10% automático para estadías de 28
              noches o más.
            </p>
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
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
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
                    <span className="text-sm">Subir fotos</span>
                  </>
                )}
              </button>
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Acepta JPG, PNG y WEBP — máx. 10 MB por imagen. La primera foto
              será la imagen principal.
            </p>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Reglas de la Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label
                htmlFor="rules"
                className="text-xs uppercase text-muted-foreground font-medium"
              >
                Reglas y Políticas
              </Label>
              <Textarea
                id="rules"
                placeholder="Describe las reglas de tu propiedad, horarios de check-in/check-out, políticas sobre mascotas, fiestas, ruido, etc."
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
          <Link href="/propietario/propiedades">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading || isUploading}
          >
            {isLoading ? "Publicando..." : "Publicar Propiedad"}
          </Button>
        </div>
      </form>
    </div>
  );
}
