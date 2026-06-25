"use client";

import { useState } from "react";
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
import { ValidationError } from "next/dist/compiled/amphtml-validator";
import { ChangePasswordFormData } from "@/types/forms";
import { validatePasswordChange } from "@/lib/validators/users";
import { cn } from "@/utils/cn";
import { Eye, EyeOff } from "lucide-react";
import { userService } from "@/lib/services/user.service";
import { useAuth } from "@/lib/contexts/auth-context";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) => {
  const { logout } = useAuth();
  const [changePasswordFormData, setChangePasswordFormData] =
    useState<ChangePasswordFormData>({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((err) => err.field === fieldName)?.message;
  };

  const handleInputChange =
    (field: keyof ChangePasswordFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      setChangePasswordFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      setErrors((prev) => prev.filter((err) => err.field !== field));
    };

  const submitChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validation = validatePasswordChange(changePasswordFormData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      await userService.changePassword({
        oldPassword: changePasswordFormData.oldPassword,
        newPassword: changePasswordFormData.newPassword,
      });

      // Need to re-login with new password
      logout();
    } catch (err: unknown) {
      console.error("Change password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva contraseña
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submitChangePassword}>
          <div className="relative">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contraseña Actual
            </Label>
            <Input
              value={changePasswordFormData.oldPassword}
              onChange={handleInputChange("oldPassword")}
              type={showPassword ? "text" : "password"}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("oldPassword")
                  ? "border-destructive"
                  : "border-border",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors absolute top-[52%] right-2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {getFieldError("oldPassword") && (
              <p className="text-xs text-destructive">
                {getFieldError("oldPassword")}
              </p>
            )}
          </div>
          <div className="relative">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nueva Contraseña
            </Label>
            <Input
              value={changePasswordFormData.newPassword}
              onChange={handleInputChange("newPassword")}
              type={showPassword ? "text" : "password"}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("newPassword")
                  ? "border-destructive"
                  : "border-border",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors absolute top-[52%] right-2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {getFieldError("newPassword") && (
              <p className="text-xs text-destructive">
                {getFieldError("newPassword")}
              </p>
            )}
          </div>
          <div className="relative">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Confirmar Nueva Contraseña
            </Label>
            <Input
              value={changePasswordFormData.confirmNewPassword}
              onChange={handleInputChange("confirmNewPassword")}
              type={showPassword ? "text" : "password"}
              className={cn(
                "w-full mt-1 border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors",
                getFieldError("confirmNewPassword")
                  ? "border-destructive"
                  : "border-border",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors absolute top-[52%] right-2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {getFieldError("confirmNewPassword") && (
              <p className="text-xs text-destructive">
                {getFieldError("confirmNewPassword")}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              Cambiar Contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
