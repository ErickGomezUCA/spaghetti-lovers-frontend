"use client"

import { useState } from "react"
import { User, Building2, CheckCircle, ShieldAlert } from "lucide-react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function RegisterPage() {
  const [role, setRole] = useState<"tenant" | "landlord">("tenant")

  return (
    <AuthPageShell
      title="Registro"
      subtitle="Crea tu cuenta de inquilino o propietario"
      footerText="¿Ya tienes cuenta?"
      footerLinkHref="/login"
      footerLinkText="Inicia Sesión"
    >
      <div className="space-y-1.5 mb-6">
        <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
          Selecciona tu perfil de uso
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRole("tenant")}
            className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all ${
              role === "tenant"
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {role === "tenant" && (
              <span className="absolute top-2 right-2">
                <CheckCircle className="w-4 h-4 text-primary fill-primary text-white" />
              </span>
            )}
            <User className="w-6 h-6 text-primary" />
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">
                Quiero Rentar
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Busco alojamiento</p>
            </div>
          </button>

          <button
            onClick={() => setRole("landlord")}
            className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all ${
              role === "landlord"
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {role === "landlord" && (
              <span className="absolute top-2 right-2">
                <CheckCircle className="w-4 h-4 text-primary fill-primary text-white" />
              </span>
            )}
            <Building2 className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">
                Quiero Publicar
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Tengo propiedades</p>
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
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              placeholder="+503 7123-4567"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Correo Electrónico
          </label>
          <input
            type="email"
            placeholder="tu@correo.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Contraseña de Acceso
          </label>
          <input
            type="password"
            placeholder="Clave de seguridad"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-start gap-2.5 bg-primary/10 border border-primary/20 rounded-lg p-3">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">Política de Verificación Residencial: </span>
            Para mantener la seguridad comunitaria de RentFlow, su cuenta requerirá la carga de un
            documento de identidad para realizar transacciones.
          </p>
        </div>

        <button className="w-full bg-primary text-primary-foreground rounded-lg py-3.5 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors">
          Completar Registro
        </button>
      </div>
    </AuthPageShell>
  )
}