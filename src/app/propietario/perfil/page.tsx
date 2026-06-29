"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Calendar,
  Building2,
  Shield,
  Clock,
  Edit,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  FileImage,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { userService } from "@/lib/services/user.service";
import { identityDocumentService } from "@/lib/services/identity-document.service";
import { DocumentStatus, IdentityDocumentResponse } from "@/types/api-responses"
import { uploadService } from "@/lib/services/upload.service";
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

const statusConfig: Record<DocumentStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "En Revisión", color: "bg-amber-100 text-amber-800", icon: Clock },
  VERIFIED: { label: "Verificado", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  
  // --- ESTADOS DE VERIFICACIÓN DE IDENTIDAD ---
  const [document, setDocument] = useState<IdentityDocumentResponse | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(true);
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempUploadedUrl, setTempUploadedUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // --- ESTADOS DEL PERFIL Y CONTRASEÑA ---
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

  const fetchMyDocument = useCallback(async () => {
    setIsDocLoading(true);
    try {
      const res = await identityDocumentService.getMyDocument();
      setDocument(res.data || null);
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setIsDocLoading(false);
    }
  }, []);

  useEffect(() => {
    userService.getProfile().then((res) => setProfile(res.data)).catch(() => {});
    fetchMyDocument();
  }, [fetchMyDocument]);

  const averageScore = profile?.averageScore?.toFixed(1) ?? "N/A";

  // --- HANDLERS DE VERIFICACIÓN DE IDENTIDAD ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      const result = await uploadService.uploadImage(file);
      setTempUploadedUrl(result.data.url);
    } catch (err: any) {
      console.error("Error subiendo archivo:", err);
      setUploadError(err.message || "Error al subir el archivo.");
      setFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!tempUploadedUrl) {
      setUploadError("Por favor selecciona y sube un archivo primero.");
      return;
    }

    setIsSubmittingDoc(true);
    setUploadError(null);
    try {
      await identityDocumentService.submitDocument(tempUploadedUrl);
      setShowUploadDialog(false);
      setTempUploadedUrl("");
      setFileName("");
      toast({ title: "Documento enviado", description: "Tu documento está en revisión." });
      fetchMyDocument(); 
    } catch (error: any) {
      console.error("Error submit document:", error);
      setUploadError(error?.response?.data?.message || "Error al procesar la solicitud.");
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const resetUploadState = (open: boolean) => {
    setShowUploadDialog(open);
    if (!open) {
      setTempUploadedUrl("");
      setFileName("");
      setUploadError(null);
    }
  };

  // --- HANDLERS DE PERFIL ---
  const getProfileError = (field: string) => profileErrors.find((e) => e.field === field)?.message;
  const getPasswordError = (field: string) => passwordErrors.find((e) => e.field === field)?.message;

  const handleProfileChange = (field: keyof UpdateProfileFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "phone" ? formatPhone(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => prev.filter((err) => err.field !== field));
  };

  const handlePasswordChange = (field: keyof ChangePasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      authClient.saveAuth({ token: authClient.getAuth()?.token ?? "", user: updatedUser.data });
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus cambios fueron guardados." });
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
      await userService.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      logout();
    } catch (err) {
      console.error("Password change error:", err);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
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
              <h2 className="text-xl font-semibold">{user?.name ?? "Nombre no disponible"}</h2>
              <Badge className="mt-2 bg-primary/10 text-primary">
                {user?.role === "LANDLORD" ? "Propietario" : "Inquilino"}
              </Badge>
              <div className="flex items-center gap-1 mt-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageScore}</span>
                <span className="text-muted-foreground">({profile?.ratingsCount ?? 0} reseñas)</span>
              </div>
              {profile?.createdAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{user?.email ?? "Email no disponible"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{user?.phone ?? "Teléfono no disponible"}</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* SECCIÓN DE VERIFICACIÓN INTEGRADA */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${document?.documentStatus === 'VERIFIED' ? 'text-green-600' : 'text-primary'}`} />
                <span className="font-medium">Estado de Verificación</span>
              </div>
              
              {isDocLoading ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comprobando...
                </div>
              ) : document ? (
                <div className="space-y-2">
                  <Badge className={`${statusConfig[document.documentStatus].color} border-none`}>
                    {(() => {
                      const Icon = statusConfig[document.documentStatus].icon;
                      return <Icon className="w-3 h-3 mr-1" />;
                    })()}
                    {statusConfig[document.documentStatus].label}
                  </Badge>
                  
                  {document.documentStatus === 'PENDING' && (
                    <p className="text-xs text-muted-foreground">
                      Tu documento está en revisión. Te notificaremos pronto.
                    </p>
                  )}

                  {document.documentStatus === 'REJECTED' && (
                    <>
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
                        <strong>Motivo:</strong> {document.rejectionReason || "Documento no válido"}
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => setShowUploadDialog(true)}>
                        <Upload className="w-4 h-4 mr-2" /> Subir Nuevo
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="text-muted-foreground">
                    No verificado
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sube una foto de tu DUI, pasaporte o licencia para verificar tu identidad y operar sin restricciones.
                  </p>
                  <Button size="sm" className="w-full bg-primary" onClick={() => setShowUploadDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" /> Subir Documento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-blue-500">
              <CardContent className="p-4 text-center">
                <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{profile?.propertiesCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Propiedades</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{profile?.reservationsCount ?? 0}</p>
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
                <p className="text-2xl font-semibold">{profile?.ratingsCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Reseñas</p>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de Edición */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">Nombre Completo</Label>
                  <Input
                    value={formData.name}
                    onChange={handleProfileChange("name")}
                    disabled={!isEditing}
                    className={`bg-input ${getProfileError("name") ? "border-destructive" : ""}`}
                  />
                  {getProfileError("name") && <p className="text-xs text-destructive">{getProfileError("name")}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={handleProfileChange("phone")}
                    disabled={!isEditing}
                    className={`bg-input ${getProfileError("phone") ? "border-destructive" : ""}`}
                  />
                  {getProfileError("phone") && <p className="text-xs text-destructive">{getProfileError("phone")}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Correo Electrónico</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange("email")}
                  disabled={!isEditing}
                  className={`bg-input ${getProfileError("email") ? "border-destructive" : ""}`}
                />
                {getProfileError("email") && <p className="text-xs text-destructive">{getProfileError("email")}</p>}
              </div>
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isProfileLoading}>
                    Cancelar
                  </Button>
                  <Button className="bg-primary" onClick={handleProfileSubmit} disabled={isProfileLoading}>
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cambio de Contraseña */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Contraseña Actual</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange("oldPassword")}
                  className={`bg-input ${getPasswordError("oldPassword") ? "border-destructive" : ""}`}
                />
                {getPasswordError("oldPassword") && <p className="text-xs text-destructive">{getPasswordError("oldPassword")}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">Nueva Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    className={`bg-input ${getPasswordError("newPassword") ? "border-destructive" : ""}`}
                  />
                  {getPasswordError("newPassword") && <p className="text-xs text-destructive">{getPasswordError("newPassword")}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-medium">Confirmar Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange("confirmNewPassword")}
                    className={`bg-input ${getPasswordError("confirmNewPassword") ? "border-destructive" : ""}`}
                  />
                  {getPasswordError("confirmNewPassword") && <p className="text-xs text-destructive">{getPasswordError("confirmNewPassword")}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-primary" onClick={handlePasswordSubmit} disabled={isPasswordLoading}>
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOG PARA SUBIR DOCUMENTO */}
      <Dialog open={showUploadDialog} onOpenChange={resetUploadState}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Documento de Identidad</DialogTitle>
            <DialogDescription>Sube una foto o escaneo de tu documento (DUI, Pasaporte o Licencia).</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Archivo del Documento
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept="image/jpeg, image/png, application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploading || isSubmittingDoc}
                />
                
                <Label
                  htmlFor="document-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${tempUploadedUrl ? 'border-green-500 bg-green-50/50' : 'border-border hover:bg-muted/50'}
                    ${(isUploading || isSubmittingDoc) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Subiendo a la nube...</p>
                      </>
                    ) : tempUploadedUrl ? (
                      <>
                        <FileImage className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{fileName}</p>
                        <p className="text-xs text-green-600 mt-1">¡Archivo listo para enviar!</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Haz clic aquí para seleccionar</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG o PDF (máx. 10MB)</p>
                      </>
                    )}
                  </div>
                </Label>
              </div>
            </div>

            {uploadError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex gap-2 items-start">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{uploadError}</p>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Tu documento será almacenado de forma segura y solo será utilizado para verificar tu identidad.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => resetUploadState(false)} disabled={isUploading || isSubmittingDoc}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitDocument} disabled={!tempUploadedUrl || isUploading || isSubmittingDoc}>
              {isSubmittingDoc ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><CheckCircle2 className="mr-1 h-4 w-4" /> Enviar para Revisión</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}