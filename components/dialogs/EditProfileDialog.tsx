"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/lib/contexts/auth-context";
import { ValidationError } from "next/dist/compiled/amphtml-validator";
import { UpdateProfileFormData } from "@/types/forms";
import { formatPhone, validateProfileUpdate } from "@/lib/validators/users";
import { userService } from "@/lib/services/user.service";
import { cn } from "@/utils/cn";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const [editFormData, setEditFormData] = useState<UpdateProfileFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: formatPhone(user.phone ?? "") ?? "",
      });
    }
  }, [user]);

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((err) => err.field === fieldName)?.message;
  };

  const handleInputChange =
    (field: keyof UpdateProfileFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      if (field === "phone") {
        value = formatPhone(value);
      }

      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      setErrors((prev) => prev.filter((err) => err.field !== field));
    };

  const submitEditForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const validation = validateProfileUpdate(editFormData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      userService.update({
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
      });

      // TODO: reload page
    } catch (err: unknown) {
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submitEditForm}>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre Completo
            </Label>
            <Input
              value={editFormData.name}
              onChange={handleInputChange("name")}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("name") ? "border-destructive" : "border-border",
              )}
            />
            {getFieldError("name") && (
              <p className="text-xs text-destructive">
                {getFieldError("name")}
              </p>
            )}
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Correo Electrónico
            </Label>
            <Input
              type="email"
              value={editFormData.email}
              onChange={handleInputChange("email")}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("email") ? "border-destructive" : "border-border",
              )}
            />
            {getFieldError("email") && (
              <p className="text-xs text-destructive">
                {getFieldError("email")}
              </p>
            )}
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Teléfono de Contacto
            </Label>
            <Input
              type="tel"
              value={editFormData.phone}
              onChange={handleInputChange("phone")}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("phone") ? "border-destructive" : "border-border",
              )}
            />
            {getFieldError("phone") && (
              <p className="text-xs text-destructive">
                {getFieldError("phone")}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
