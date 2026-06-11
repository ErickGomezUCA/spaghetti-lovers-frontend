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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  MoreVertical,
  Shield,
  Building2,
  Star,
  Ban,
  CheckCircle,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const users = [
  {
    id: "USR-001",
    name: "Juan Carlos Rodríguez",
    email: "juan.rodriguez@email.com",
    phone: "+503 7890-1234",
    role: "Landlord",
    status: "active",
    verificationStatus: "verified",
    properties: 5,
    reservations: 45,
    rating: 4.8,
    createdAt: "2023-06-15",
  },
  {
    id: "USR-002",
    name: "María García López",
    email: "maria.garcia@email.com",
    phone: "+503 7890-5678",
    role: "Tenant",
    status: "active",
    verificationStatus: "verified",
    properties: 0,
    reservations: 8,
    rating: 4.5,
    createdAt: "2023-08-20",
  },
  {
    id: "USR-003",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "+503 7890-9012",
    role: "Landlord",
    status: "active",
    verificationStatus: "pending",
    properties: 2,
    reservations: 12,
    rating: 4.2,
    createdAt: "2024-01-10",
  },
  {
    id: "USR-004",
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    phone: "+503 7890-3456",
    role: "Tenant",
    status: "suspended",
    verificationStatus: "rejected",
    properties: 0,
    reservations: 3,
    rating: 2.8,
    createdAt: "2024-02-15",
  },
  {
    id: "USR-005",
    name: "Pedro Admin",
    email: "pedro.admin@rentflow.com",
    phone: "+503 7890-0000",
    role: "Admin",
    status: "active",
    verificationStatus: "verified",
    properties: 0,
    reservations: 0,
    rating: 0,
    createdAt: "2023-01-01",
  },
]

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  Landlord: "bg-blue-100 text-blue-700 border-blue-200",
  Tenant: "bg-green-100 text-green-700 border-green-200",
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-700",
}

const verificationColors: Record<string, string> = {
  verified: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
}

const verificationLabels: Record<string, string> = {
  verified: "Verificado",
  pending: "Pendiente",
  rejected: "Rechazado",
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground mt-1">Gestión de usuarios del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {users.filter((u) => u.role === "Landlord").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Propietarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {users.filter((u) => u.role === "Tenant").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Inquilinos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {users.filter((u) => u.role === "Admin").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {users.filter((u) => u.verificationStatus === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Verificaciones Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Landlord">Propietario</SelectItem>
                <SelectItem value="Tenant">Inquilino</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4">Usuario</TableHead>
                <TableHead className="py-4">Contacto</TableHead>
                <TableHead className="py-4">Rol</TableHead>
                <TableHead className="py-4">Estado</TableHead>
                <TableHead className="py-4">Verificación</TableHead>
                <TableHead className="py-4">Actividad</TableHead>
                <TableHead className="py-4">Calificación</TableHead>
                <TableHead className="py-4">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" /> 
                        <span>{user.email}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" /> 
                        <span>{user.phone}</span>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={statusColors[user.status]}>
                      {user.status === "active" ? "Activo" : "Suspendido"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={verificationColors[user.verificationStatus]}>
                      {verificationLabels[user.verificationStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> 
                        <span>{user.properties} propiedades</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> 
                        <span>{user.reservations} reservas</span>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {user.rating > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{user.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalle de Usuario</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold">{user.name}</h3>
                                <Badge className={`mt-2 ${roleColors[user.role]}`}>{user.role}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Email</p>
                                <p className="font-medium">{user.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Teléfono</p>
                                <p className="font-medium">{user.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Miembro desde</p>
                                <p className="font-medium">{user.createdAt}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Calificación</p>
                                <p className="font-medium flex items-center gap-1">
                                  {user.rating > 0 ? (
                                    <>
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      {user.rating}
                                    </>
                                  ) : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                              {user.status === "active" ? (
                                <Button variant="destructive" className="flex-1">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspender Usuario
                                </Button>
                              ) : (
                                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Reactivar Usuario
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" /> Ver perfil completo
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" /> Ver verificación
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="w-4 h-4 mr-2" /> Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" /> Reactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
