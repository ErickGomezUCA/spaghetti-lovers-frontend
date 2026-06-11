export type UserRole = "admin" | "propietario" | "tenant"

export interface DemoUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

export const demoUsers: DemoUser[] = [
  {
    id: "demo-admin",
    name: "Alicia Torres",
    email: "admin@rentflow.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "demo-landlord",
    name: "Juan Pérez",
    email: "propietario@rentflow.com",
    password: "propietario123",
    role: "propietario",
  },
  {
    id: "demo-tenant",
    name: "María Gómez",
    email: "tenant@rentflow.com",
    password: "tenant123",
    role: "tenant",
  },
]

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "Administrador"
    case "propietario":
      return "Propietario"
    case "tenant":
      return "Inquilino"
  }
}

export function getRoleHref(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin"
    case "propietario":
      return "/propietario"
    case "tenant":
      return "/tenant"
  }
}
