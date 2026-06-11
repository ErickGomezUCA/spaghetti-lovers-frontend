"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PropertyStatus = "active" | "reserved" | "inactive" | "unavailable"

interface Property {
  id: string
  title: string
  propertyType: string
  address: string
  city: string
  landlord: string
  landlordEmail: string
  basePricePerNight: number
  status: PropertyStatus
  createdAt: string
  reservationsCount: number
}

const mockProperties: Property[] = [
  {
    id: "1",
    title: "Apartamento Vista al Mar",
    propertyType: "apartamento",
    address: "Calle Principal 123",
    city: "San Salvador",
    landlord: "Carlos Mendez",
    landlordEmail: "carlos@email.com",
    basePricePerNight: 85,
    status: "active",
    createdAt: "2024-01-15",
    reservationsCount: 12,
  },
  {
    id: "2",
    title: "Casa de Playa Familiar",
    propertyType: "casa_playa",
    address: "Playa El Tunco",
    city: "La Libertad",
    landlord: "Maria Rodriguez",
    landlordEmail: "maria@email.com",
    basePricePerNight: 150,
    status: "reserved",
    createdAt: "2024-02-20",
    reservationsCount: 8,
  },
  {
    id: "3",
    title: "Loft Centro Historico",
    propertyType: "loft",
    address: "Av. Revolucion 456",
    city: "Santa Ana",
    landlord: "Roberto Flores",
    landlordEmail: "roberto@email.com",
    basePricePerNight: 65,
    status: "inactive",
    createdAt: "2024-03-10",
    reservationsCount: 3,
  },
  {
    id: "4",
    title: "Villa con Piscina",
    propertyType: "villa",
    address: "Residencial Los Pinos",
    city: "Antiguo Cuscatlan",
    landlord: "Ana Martinez",
    landlordEmail: "ana@email.com",
    basePricePerNight: 200,
    status: "active",
    createdAt: "2024-01-05",
    reservationsCount: 15,
  },
]

const statusConfig: Record<PropertyStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Activa", color: "bg-green-100 text-green-700", icon: CheckCircle },
  reserved: { label: "Reservada", color: "bg-blue-100 text-blue-700", icon: Calendar },
  inactive: { label: "Inactiva", color: "bg-gray-100 text-gray-700", icon: XCircle },
  unavailable: { label: "No disponible", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
}

const propertyTypeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  habitacion: "Habitacion",
  estudio: "Estudio",
  villa: "Villa",
  cabaña: "Cabana",
  casa_playa: "Casa de Playa",
  casa_campo: "Casa de Campo",
  loft: "Loft",
  condominio: "Condominio",
  hostal: "Hostal",
  hotel: "Hotel",
  duplex: "Duplex",
  penthouse: "Penthouse",
}

export default function AdminPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all")

  const filteredProperties = mockProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.landlord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockProperties.length,
    active: mockProperties.filter((p) => p.status === "active").length,
    reserved: mockProperties.filter((p) => p.status === "reserved").length,
    inactive: mockProperties.filter((p) => p.status === "inactive").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Propiedades del Sistema</h1>
        <p className="text-muted-foreground mt-1">Supervision de todas las propiedades registradas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Propiedades</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.reserved}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactivas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-600" />
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
                placeholder="Buscar por titulo, propietario o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "Todos los estados" : statusConfig[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Activas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("reserved")}>
                  Reservadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactivas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("unavailable")}>
                  No disponibles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Propiedades ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const status = statusConfig[property.status]
              const StatusIcon = status.icon
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
                        <h3 className="font-medium text-foreground">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {propertyTypeLabels[property.propertyType] || property.propertyType}
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
                        {property.landlord}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${property.basePricePerNight}/noche
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {property.reservationsCount} reservas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="w-4 h-4 mr-2" />
                          Ver propietario
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Ver reservas
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
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
    </div>
  )
}
