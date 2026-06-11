"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Building2,
  Shield,
  Upload,
  CheckCircle,
  Clock,
  Edit,
} from "lucide-react"

// Mock user data
const userData = {
  id: "USR-001",
  name: "Juan Carlos Rodríguez",
  email: "juan.rodriguez@email.com",
  phone: "+503 7890-1234",
  role: "Landlord",
  avatar: null,
  createdAt: "2023-06-15",
  verificationStatus: "verified",
  documentUrl: "/documents/dui-juan.pdf",
  stats: {
    totalProperties: 5,
    totalReservations: 45,
    averageRating: 4.8,
    totalRatings: 32,
  },
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Administra tu información personal</p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          className={!isEditing ? "bg-primary" : ""}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <Badge className="mt-2 bg-primary/10 text-primary">
                Propietario
              </Badge>
              <div className="flex items-center gap-1 mt-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{userData.stats.averageRating}</span>
                <span className="text-muted-foreground">({userData.stats.totalRatings} reseñas)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Miembro desde {new Date(userData.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{userData.phone}</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Verification Status */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">Estado de Verificación</span>
              </div>
              {userData.verificationStatus === "verified" ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              ) : userData.verificationStatus === "pending" ? (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Clock className="w-3 h-3 mr-1" />
                  En revisión
                </Badge>
              ) : (
                <div>
                  <Badge className="bg-red-100 text-red-700 mb-2">No verificado</Badge>
                  <Button size="sm" className="w-full mt-2 bg-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir documento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-blue-500">
              <CardContent className="p-4 text-center">
                <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{userData.stats.totalProperties}</p>
                <p className="text-xs text-muted-foreground">Propiedades</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{userData.stats.totalReservations}</p>
                <p className="text-xs text-muted-foreground">Reservas</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-yellow-500">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{userData.stats.averageRating}</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-purple-500">
              <CardContent className="p-4 text-center">
                <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{userData.stats.totalRatings}</p>
                <p className="text-xs text-muted-foreground">Reseñas</p>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Teléfono
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className="bg-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-input"
                />
              </div>
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-primary">Guardar Cambios</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Contraseña Actual
                </Label>
                <Input type="password" placeholder="••••••••" className="bg-input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Nueva Contraseña
                  </Label>
                  <Input type="password" placeholder="••••••••" className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Confirmar Contraseña
                  </Label>
                  <Input type="password" placeholder="••••••••" className="bg-input" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-primary">Cambiar Contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
