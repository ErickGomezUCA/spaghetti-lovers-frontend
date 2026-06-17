"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { authService } from "@/lib/services/auth.service";
import { ApiError } from "@/lib/exceptions/exceptions";
import { apiClient } from "@/lib/api-client";
import { AppUser } from "@/types/api-responses";
import { getRoleHref } from "@/utils/roles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await authService.login(email, password);
      apiClient.saveAuth(res.data); // Save token + user
      const { user } = res.data;

      setError("");
      router.push(getRoleHref(user.role));
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión.");
      }
    }
  };

  return (
    <AuthPageShell
      title="Acceder"
      subtitle="Ingresa a tu cuenta residencial RentFlow"
      footerText="¿No eres miembro?"
      footerLinkHref="/registro"
      footerLinkText="Regístrate ahora"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Correo de Acceso
          </label>
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Contraseña
            </label>
            <Link
              href="#"
              className="text-[11px] font-semibold tracking-wider uppercase text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-lg py-3.5 text-[11px] font-bold tracking-widest uppercase hover:bg-foreground/90 transition-colors mt-2"
        >
          Ingresar al Portal
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthPageShell>
  );
}
