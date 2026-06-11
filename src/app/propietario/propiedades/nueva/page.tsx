"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Upload, X, MapPin, DollarSign, Home, Image } from "lucide-react"

const propertyTypes = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "habitacion", label: "Habitación" },
  { value: "estudio", label: "Estudio" },
  { value: "villa", label: "Villa" },
  { value: "cabaña", label: "Cabaña" },
  { value: "casa_playa", label: "Casa de Playa" },
  { value: "casa_campo", label: "Casa de Campo" },
  { value: "loft", label: "Loft" },
  { value: "condominio", label: "Condominio" },
  { value: "hostal", label: "Hostal" },
  { value: "hotel", label: "Hotel" },
  { value: "duplex", label: "Dúplex" },
  { value: "penthouse", label: "Penthouse" },
]

export default function NewPropertyPage() {
  const [photos, setPhotos] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
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
  })

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const newPhoto = `/placeholder.svg?height=200&width=300&text=Foto${photos.length + 1}`
    setPhotos([...photos, newPhoto])
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

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
          <h1 className="text-2xl font-semibold text-foreground">Nueva Propiedad</h1>
          <p className="text-muted-foreground">Registra una nueva propiedad para alquilar</p>
        </div>
      </div>

      <form className="space-y-6">
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
                <Label htmlFor="title" className="text-xs uppercase text-muted-foreground font-medium">
                  Título de la Propiedad
                </Label>
                <Input
                  id="title"
                  placeholder="Ej. Apartamento con vista al mar"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-xs uppercase text-muted-foreground font-medium">
                  Tipo de Propiedad
                </Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
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
              <Label htmlFor="description" className="text-xs uppercase text-muted-foreground font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe tu propiedad, sus características y lo que la hace especial..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-input"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-xs uppercase text-muted-foreground font-medium">
                  Habitaciones
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-xs uppercase text-muted-foreground font-medium">
                  Baños
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGuests" className="text-xs uppercase text-muted-foreground font-medium">
                  Huéspedes Máx.
                </Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.maxGuests}
                  onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaSqm" className="text-xs uppercase text-muted-foreground font-medium">
                  Área (m²)
                </Label>
                <Input
                  id="areaSqm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.areaSqm}
                  onChange={(e) => handleInputChange("areaSqm", e.target.value)}
                  className="bg-input"
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
              <Label htmlFor="address" className="text-xs uppercase text-muted-foreground font-medium">
                Dirección
              </Label>
              <Input
                id="address"
                placeholder="Calle, número, colonia"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs uppercase text-muted-foreground font-medium">
                  Ciudad
                </Label>
                <Input
                  id="city"
                  placeholder="San Salvador"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs uppercase text-muted-foreground font-medium">
                  Departamento
                </Label>
                <Input
                  id="department"
                  placeholder="San Salvador"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs uppercase text-muted-foreground font-medium">
                  País
                </Label>
                <Input
                  id="country"
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
                <Label htmlFor="basePricePerNight" className="text-xs uppercase text-muted-foreground font-medium">
                  Precio por Noche (USD)
                </Label>
                <Input
                  id="basePricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.basePricePerNight}
                  onChange={(e) => handleInputChange("basePricePerNight", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaningFee" className="text-xs uppercase text-muted-foreground font-medium">
                  Tarifa de Limpieza (USD)
                </Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cleaningFee}
                  onChange={(e) => handleInputChange("cleaningFee", e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDepositAmount" className="text-xs uppercase text-muted-foreground font-medium">
                  Depósito de Garantía (USD)
                </Label>
                <Input
                  id="securityDepositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.securityDepositAmount}
                  onChange={(e) => handleInputChange("securityDepositAmount", e.target.value)}
                  className="bg-input"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              * Se aplica un descuento del 10% automático para estadías de 28 noches o más.
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
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
                onClick={handlePhotoUpload}
                className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Subir foto</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sube al menos 3 fotos de tu propiedad. La primera foto será la imagen principal.
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
              <Label htmlFor="rules" className="text-xs uppercase text-muted-foreground font-medium">
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
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button className="bg-primary hover:bg-primary/90">
            Publicar Propiedad
          </Button>
        </div>
      </form>
    </div>
  )
}
