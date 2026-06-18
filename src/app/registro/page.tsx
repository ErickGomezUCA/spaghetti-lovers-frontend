"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, CheckCircle, ShieldAlert } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { authService } from "@/lib/services/auth.service";
import { ApiError } from "@/lib/exceptions/api-exceptions";
import { apiClient } from "@/lib/api-client";
import {
  validateRegistration,
  formatPhone,
  ValidationError,
} from "@/lib/validators/auth";
import { RegisterFormData } from "@/types/forms";
import { getRoleHref } from "@/utils/roles";
import { cn } from "@/utils/cn";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"TENANT" | "LANDLORD">("TENANT");
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((err) => err.field === fieldName)?.message;
  };

  const handleInputChange =
    (field: keyof RegisterFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      // Auto-format phone number
      if (field === "phone") {
        value = formatPhone(value);
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      setErrors((prev) => prev.filter((err) => err.field !== field));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    // Validate form
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
      });
      apiClient.saveAuth(res.data);

      const { user } = res.data;

      router.push(getRoleHref(user.role));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setSubmitError(
          err.message || "Error al registrarse. Intenta de nuevo.",
        );
      } else {
        setSubmitError("Error al registrarse. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Registro"
      subtitle="Crea tu cuenta de inquilino o propietario"
      footerText="¿Ya tienes cuenta?"
      footerLinkHref="/login"
      footerLinkText="Inicia Sesión"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1.5 mb-6">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Selecciona tu perfil de uso
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("TENANT")}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all",
                role === "TENANT"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {role === "TENANT" && (
                <span className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-primary fill-primary text-white" />
                </span>
              )}
              <User className="w-6 h-6 text-primary" />
              <div className="text-center">
                <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">
                  Quiero Rentar
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Busco alojamiento
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("LANDLORD")}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all",
                role === "LANDLORD"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {role === "LANDLORD" && (
                <span className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-primary fill-primary text-white" />
                </span>
              )}
              <Building2 className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">
                  Quiero Publicar
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Tengo propiedades
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ej. Valeria Gómez"
                value={formData.name}
                onChange={handleInputChange("name")}
                className={cn(
                  "w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                  getFieldError("name")
                    ? "border-destructive"
                    : "border-border",
                )}
              />
              {getFieldError("name") && (
                <p className="text-xs text-destructive">
                  {getFieldError("name")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                placeholder="+503 1234-5678"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                className={cn(
                  "w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                  getFieldError("phone")
                    ? "border-destructive"
                    : "border-border",
                )}
              />
              {getFieldError("phone") && (
                <p className="text-xs text-destructive">
                  {getFieldError("phone")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleInputChange("email")}
              className={cn(
                "w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("email") ? "border-destructive" : "border-border",
              )}
            />
            {getFieldError("email") && (
              <p className="text-xs text-destructive">
                {getFieldError("email")}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              placeholder="Clave de seguridad"
              value={formData.password}
              onChange={handleInputChange("password")}
              className={cn(
                "w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("password")
                  ? "border-destructive"
                  : "border-border",
              )}
            />
            {getFieldError("password") && (
              <p className="text-xs text-destructive">
                {getFieldError("password")}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2.5 bg-primary/10 border border-primary/20 rounded-lg p-3">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">
                Política de Verificación Residencial:{" "}
              </span>
              Para mantener la seguridad comunitaria de RentFlow, su cuenta
              requerirá la carga de un documento de identidad para realizar
              transacciones.
            </p>
          </div>

          {submitError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-xs text-destructive">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3.5 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Completando Registro..." : "Completar Registro"}
          </button>
        </div>
      </form>
    </AuthPageShell>
  );
}
