"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tenant route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Algo salió mal</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        {error.message || "Ocurrió un error inesperado."}
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
