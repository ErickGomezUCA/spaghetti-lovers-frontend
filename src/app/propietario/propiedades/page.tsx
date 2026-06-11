"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const properties = [
  {
    id: "1",
    title: "Apartamento Centro Histórico",
    address: "Calle Principal 123, San Salvador",
    type: "apartamento",
    status: "active",
    pricePerNight: 85,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    reservations: 12,
  },
  {
    id: "2",
    title: "Casa de Playa Costa del Sol",
    address: "Km 75 Carretera Litoral, La Paz",
    type: "casa_playa",
    status: "reserved",
    pricePerNight: 150,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    reservations: 8,
  },
  {
    id: "3",
    title: "Loft Moderno Zona Rosa",
    address: "Boulevard del Hipódromo 456, San Salvador",
    type: "loft",
    status: "active",
    pricePerNight: 65,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    reservations: 20,
  },
  {
    id: "4",
    title: "Cabaña en la Montaña",
    address: "Cerro Verde, Santa Ana",
    type: "cabaña",
    status: "inactive",
    pricePerNight: 95,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    reservations: 5,
  },
]

const propertyTypes: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  habitacion: "Habitación",
  estudio: "Estudio",
  villa: "Villa",
  cabaña: "Cabaña",
  casa_playa: "Casa de Playa",
  casa_campo: "Casa de Campo",
  loft: "Loft",
  condominio: "Condominio",
  hostal: "Hostal",
  hotel: "Hotel",
  duplex: "Dúplex",
  penthouse: "Penthouse",
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  reserved: "bg-blue-100 text-blue-700 border-blue-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  unavailable: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  active: "Activa",
  reserved: "Reservada",
  inactive: "Inactiva",
  unavailable: "No disponible",
}

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesType = typeFilter === "all" || property.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mis Propiedades</h1>
          <p className="text-muted-foreground">Gestiona tus propiedades en alquiler</p>
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
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
                <SelectItem value="inactive">Inactiva</SelectItem>
                <SelectItem value="unavailable">No disponible</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(propertyTypes).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-shadow">
            {/* Property Image */}
            <div className="relative h-48 bg-muted">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-3 left-3 ${statusColors[property.status]}`}>
                {statusLabels[property.status]}
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
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" /> Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" /> Ver calendario
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
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
                      {propertyTypes[property.type]}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{property.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mt-2">{property.title}</h3>
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
                    <span className="text-xl font-semibold text-primary">${property.pricePerNight}</span>
                    <span className="text-sm text-muted-foreground">/noche</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {property.reservations} reservas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron propiedades</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No hay propiedades que coincidan con los filtros seleccionados.
              Intenta ajustar tus criterios de búsqueda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
