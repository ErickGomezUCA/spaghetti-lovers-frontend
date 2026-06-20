"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  Star,
  Shield,
  Edit,
  Lock,
  CheckCircle2,
  CalendarDays,
  Home,
  FileCheck,
} from "lucide-react";
import { mockReservations, mockIdentityDocument } from "@/lib/mock-data";
import { useAuth } from "@/lib/contexts/auth-context";
import { ValidationError } from "next/dist/compiled/amphtml-validator";
import { UpdateProfileFormData } from "@/types/forms";
import { formatPhone, validateProfileUpdate } from "@/lib/validators/users";
import { userService } from "@/lib/services/user.service";
import EditProfileDialog from "@/components/dialogs/EditProfileDialog";

export default function ProfilePage() {
  const { user } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const totalReservations = mockReservations.length;
  const completedReservations = mockReservations.filter(
    (r) => r.reservationStatus === "completed",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row">
                <h2 className="text-2xl font-bold">
                  {user?.name ?? "Nombre no disponible"}
                </h2>
                {mockIdentityDocument?.documentStatus === "verified" && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verificado
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Inquilino desde TODO</p>
              {/* TODO: Fetch createdAt field */}
              <div className="mt-2 flex items-center justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">
                    {/* TODO: Implement average rating {user?.averageRating} */}
                    TODO
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {/* TODO: Implement total ratings ({user?.totalRatings} calificaciones) */}
                    TODO
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-1 h-4 w-4" /> Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Correo Electrónico
                </p>
                <p className="font-medium">
                  {user?.email ?? "Email no disponible"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-medium">
                  {user?.phone ?? "Teléfono no disponible"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-4 text-center">
                <Home className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold">{totalReservations}</p>
                <p className="text-xs text-muted-foreground">
                  Reservas Totales
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold">
                  {completedReservations}
                </p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
              <div
                className="rounded-lg bg-seconda
        onOpenChange={setShowEditDialog}ry p-4 text-center"
              >
                <Star className="mx-auto h-6 w-6 text-amber-500" />
                <p className="mt-2 text-2xl font-bold">
                  {/* TODO: Implement average rating {user?.averageRating} */}
                  TODO
                </p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
              <div className="rounded-lg bg-secondary p-4 text-center">
                <FileCheck className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-2 text-2xl font-bold">
                  {mockIdentityDocument?.documentStatus === "verified"
                    ? "Sí"
                    : "No"}
                </p>
                <p className="text-xs text-muted-foreground">Verificado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Contraseña</p>
                  <p className="text-sm text-muted-foreground">
                    Última actualización hace 3 meses
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
              >
                Cambiar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Verificación de Identidad</p>
                  <p className="text-sm text-muted-foreground">
                    {mockIdentityDocument?.documentStatus === "verified"
                      ? "Documento verificado"
                      : "Pendiente de verificación"}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  mockIdentityDocument?.documentStatus === "verified"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }
              >
                {mockIdentityDocument?.documentStatus === "verified"
                  ? "Verificado"
                  : "Pendiente"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones por Email</p>
                <p className="text-sm text-muted-foreground">
                  Recibir actualizaciones de reservas
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones SMS</p>
                <p className="text-sm text-muted-foreground">
                  Alertas de acceso y recordatorios
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Idioma</p>
                <p className="text-sm text-muted-foreground">Español (ES)</p>
              </div>
              <Button variant="ghost" size="sm">
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña Actual
              </Label>
              <Input className="mt-1" type="password" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nueva Contraseña
              </Label>
              <Input className="mt-1" type="password" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confirmar Nueva Contraseña
              </Label>
              <Input className="mt-1" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancelar
            </Button>
            <Button>Cambiar Contraseña</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
