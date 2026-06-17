import { UserRole } from "@/types/api-responses";

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "LANDLORD":
      return "Propietario";
    case "TENANT":
      return "Inquilino";
  }
}

export function getRoleHref(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "LANDLORD":
      return "/propietario";
    case "TENANT":
      return "/tenant";
  }
}
