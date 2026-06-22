"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Star,
  Calendar,
  Building2,
  Shield,
  Clock,
  Edit,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { userService } from "@/lib/services/user.service";
import { authClient } from "@/lib/clients/auth-client";
import { UserProfileResponse } from "@/types/api-responses";
import { useToast } from "@/components/ui/use-toast";
import {
  formatPhone,
  validateProfileUpdate,
  validatePasswordChange,
  ValidationError,
} from "@/lib/validators/users";
import { UpdateProfileFormData, ChangePasswordFormData } from "@/types/forms";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState<ValidationError[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<ValidationError[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: formatPhone(user.phone ?? ""),
      });
    }
  }, [user]);

  useEffect(() => {
    userService.getProfile().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const averageScore = profile?.averageScore?.toFixed(1) ?? "N/A";

  const getProfileError = (field: string) =>
    profileErrors.find((e) => e.field === field)?.message;

  const getPasswordError = (field: string) =>
    passwordErrors.find((e) => e.field === field)?.message;

  const handleProfileChange =
    (field: keyof UpdateProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "phone" ? formatPhone(e.target.value) : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      setProfileErrors((prev) => prev.filter((err) => err.field !== field));
    };

  const handlePasswordChange =
    (field: keyof ChangePasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
      setPasswordErrors((prev) => prev.filter((err) => err.field !== field));
    };

  const handleProfileSubmit = async () => {
    const validation = validateProfileUpdate(formData);
    if (!validation.isValid) {
      setProfileErrors(validation.errors);
      return;
    }

    setIsProfileLoading(true);
    try {
      const updatedUser = await userService.update(formData);
      authClient.saveAuth({
        token: authClient.getAuth()?.token ?? "",
        user: updatedUser.data,
      });
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus cambios fueron guardados correctamente." });
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    const validation = validatePasswordChange(passwordData);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    setIsPasswordLoading(true);
    try {
      await userService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      logout();
    } catch (err) {
      console.error("Password change error:", err);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Administra tu información personal
          </p>
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
              <h2 className="text-xl font-semibold">
                {user?.name ?? "Nombre no disponible"}
              </h2>
              <Badge className="mt-2 bg-primary/10 text-primary">
                Propietario
              </Badge>
              <div className="flex items-center gap-1 mt-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageScore}</span>
                <span className="text-muted-foreground">
                  ({profile?.ratingsCount ?? 0} reseñas)
                </span>
              </div>
              {profile?.createdAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Miembro desde{" "}
                  {new Date(profile.createdAt).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  {user?.email ?? "Email no disponible"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  {user?.phone ?? "Teléfono no disponible"}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Verification Status */}
            {/* TODO: Fetch verification status from identity document endpoint */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">Estado de Verificación</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">
                <Clock className="w-3 h-3 mr-1" />
                Pendiente de implementación
              </Badge>
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
                <p className="text-2xl font-semibold">
                  {profile?.propertiesCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Propiedades</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">
                  {profile?.reservationsCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Reservas</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-yellow-500">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{averageScore}</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-purple-500">
              <CardContent className="p-4 text-center">
                <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">
                  {profile?.ratingsCount ?? 0}
                </p>
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
                    onChange={handleProfileChange("name")}
                    disabled={!isEditing}
                    className={`bg-input ${getProfileError("name") ? "border-destructive" : ""}`}
                  />
                  {getProfileError("name") && (
                    <p className="text-xs text-destructive">
                      {getProfileError("name")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Teléfono
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={handleProfileChange("phone")}
                    disabled={!isEditing}
                    className={`bg-input ${getProfileError("phone") ? "border-destructive" : ""}`}
                  />
                  {getProfileError("phone") && (
                    <p className="text-xs text-destructive">
                      {getProfileError("phone")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange("email")}
                  disabled={!isEditing}
                  className={`bg-input ${getProfileError("email") ? "border-destructive" : ""}`}
                />
                {getProfileError("email") && (
                  <p className="text-xs text-destructive">
                    {getProfileError("email")}
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isProfileLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-primary"
                    onClick={handleProfileSubmit}
                    disabled={isProfileLoading}
                  >
                    Guardar Cambios
                  </Button>
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange("oldPassword")}
                  className={`bg-input ${getPasswordError("oldPassword") ? "border-destructive" : ""}`}
                />
                {getPasswordError("oldPassword") && (
                  <p className="text-xs text-destructive">
                    {getPasswordError("oldPassword")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Nueva Contraseña
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    className={`bg-input ${getPasswordError("newPassword") ? "border-destructive" : ""}`}
                  />
                  {getPasswordError("newPassword") && (
                    <p className="text-xs text-destructive">
                      {getPasswordError("newPassword")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange("confirmNewPassword")}
                    className={`bg-input ${getPasswordError("confirmNewPassword") ? "border-destructive" : ""}`}
                  />
                  {getPasswordError("confirmNewPassword") && (
                    <p className="text-xs text-destructive">
                      {getPasswordError("confirmNewPassword")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  className="bg-primary"
                  onClick={handlePasswordSubmit}
                  disabled={isPasswordLoading}
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
