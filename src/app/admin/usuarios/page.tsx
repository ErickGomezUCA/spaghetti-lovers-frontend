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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  Shield,
  Building2,
  Star,
  Users,
} from "lucide-react";
import { userService } from "@/lib/services/user.service";
import {
  PaginationMeta,
  UserProfileResponse,
  UserRole,
} from "@/types/api-responses";
import { useRouter } from "next/navigation";

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  LANDLORD: "bg-blue-100 text-blue-700 border-blue-200",
  TENANT: "bg-green-100 text-green-700 border-green-200",
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  LANDLORD: "Propietario",
  TENANT: "Inquilino",
};

const verificationColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

const verificationLabels: Record<string, string> = {
  APPROVED: "Verificado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(
    null,
  );

  useEffect(() => {
    setLoading(true);
    userService
      .getAllUsers({
        page: currentPage,
        pageSize: 10,
        role: roleFilter,
        search: searchTerm,
      })
      .then((res) => {
        setUsers(res.data);
        setPagination(res.pagination ?? null);
      })
      .finally(() => setLoading(false));
  }, [currentPage, roleFilter, searchTerm]);

  function handleRoleChange(value: string) {
    setRoleFilter(value);
    setCurrentPage(0);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  }

  function openProfileDialog(user: UserProfileResponse) {
    setProfileDialogOpen(true);
    setProfileData(null);
    setProfileLoading(true);
    userService
      .getUserProfileById(user.id)
      .then((res) => {
        setProfileData(res.data);
      })
      .finally(() => setProfileLoading(false));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Gestión de usuarios del sistema
        </p>
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
                  {users.filter((u) => u.role === "LANDLORD").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Propietarios
                </p>
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
                  {users.filter((u) => u.role === "TENANT").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Inquilinos
                </p>
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
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Administradores
                </p>
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
                  {
                    users.filter((u) => u.verificationStatus === "PENDING")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Verificaciones Pendientes
                </p>
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
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LANDLORD">Propietario</SelectItem>
                <SelectItem value="TENANT">Inquilino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4">Usuario</TableHead>
                    <TableHead className="py-4">Contacto</TableHead>
                    <TableHead className="py-4">Rol</TableHead>
                    <TableHead className="py-4">Verificación</TableHead>
                    <TableHead className="py-4">Actividad</TableHead>
                    <TableHead className="py-4">Calificación</TableHead>
                    <TableHead className="py-4">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
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
                            <span>{user.phone ?? "-"}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.verificationStatus ? (
                          <Badge
                            className={
                              verificationColors[user.verificationStatus] ??
                              "bg-gray-100 text-gray-700"
                            }
                          >
                            {verificationLabels[user.verificationStatus] ??
                              user.verificationStatus}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sin documento
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-sm">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{user.propertiesCount} propiedades</span>
                          </p>
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{user.reservationsCount} reservas</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.averageScore != null ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {user.averageScore.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({user.ratingsCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver perfil"
                            onClick={() => openProfileDialog(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver verificación"
                            onClick={() =>
                              router.push(
                                `/admin/verificaciones?userId=${user.id}`,
                              )
                            }
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No se encontraron usuarios.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {pagination.totalPages}
                    {" · "}
                    {pagination.totalItems} usuarios en total
                  </p>
                  <Pagination className="w-auto mx-0 justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 0) setCurrentPage((p) => p - 1);
                          }}
                          className={
                            currentPage === 0
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-3 text-sm text-muted-foreground">
                          {currentPage + 1} / {pagination.totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hastNext)
                              setCurrentPage((p) => p + 1);
                          }}
                          className={
                            !pagination.hastNext
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Usuario</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando perfil...
            </div>
          ) : profileData ? (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profileData.name}</h3>
                  <Badge className={`mt-2 ${roleColors[profileData.role]}`}>
                    {roleLabels[profileData.role]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Teléfono</p>
                  <p className="font-medium">{profileData.phone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Miembro desde
                  </p>
                  <p className="font-medium">
                    {profileData.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString(
                          "es-SV",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Verificación
                  </p>
                  <p className="font-medium">
                    {profileData.verificationStatus
                      ? (verificationLabels[profileData.verificationStatus] ??
                        profileData.verificationStatus)
                      : "Sin documento"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Propiedades
                  </p>
                  <p className="font-medium">{profileData.propertiesCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Reservas totales
                  </p>
                  <p className="font-medium">{profileData.reservationsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Reservas completadas
                  </p>
                  <p className="font-medium">
                    {profileData.completedReservationsCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Calificación
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    {profileData.averageScore != null ? (
                      <>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {profileData.averageScore.toFixed(1)}
                        <span className="text-muted-foreground text-sm">
                          ({profileData.ratingsCount} reseñas)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
