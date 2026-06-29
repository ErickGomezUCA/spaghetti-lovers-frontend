"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notificationService } from "@/lib/services/notification.service";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Bell,
  Loader2,
  UserCheck,
  Clock,
} from "lucide-react";
import { userService } from "@/lib/services/user.service";
import { propertyService } from "@/lib/services/property.service";
import { adminService } from "@/lib/services/admin.service";
import { identityDocumentService } from "@/lib/services/identity-document.service";
import { AdminMonthlySummary } from "@/types/api-responses";

interface PendingVerification {
  id: string;
  user: string;
  type: string; 
  submittedAt: string;
}

// TODO: critical maintenance
const criticalMaintenance: {
  id: string;
  property: string;
  issue: string;
  reportedAt: string;
}[] = [];

const quickActions = [
  {
    label: "Verificar Usuario",
    icon: UserCheck,
    href: "/admin/verificaciones",
  },
  { label: "Ver Propiedades", icon: Building2, href: "/admin/propiedades" },
  { label: "Ver Reportes", icon: DollarSign, href: "/admin/reportes" },
  { label: "Mantenimientos", icon: Wrench, href: "/admin/mantenimiento" },
];

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [landlordCount, setLandlordCount] = useState<number | null>(null);
  const [tenantCount, setTenantCount] = useState<number | null>(null);
  const [activeProperties, setActiveProperties] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<AdminMonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Nuevo estado para las verificaciones pendientes
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [isVerificationsLoading, setIsVerificationsLoading] = useState(true);

  const fetchUnreadNotificationsCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadNotificationsCount(response.data || 0);
    } catch (error) {
      console.error("Error cargando contador de notificaciones admin:", error);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [totalRes, landlordRes, tenantRes, propsRes] = await Promise.all([
          userService.getAllUsers({ pageSize: 1 }),
          userService.getAllUsers({ pageSize: 1, role: "LANDLORD" }),
          userService.getAllUsers({ pageSize: 1, role: "TENANT" }),
          propertyService.getAll(0, 1, { status: "ACTIVE" }),
        ]);

        const total = totalRes.pagination?.totalItems ?? 0;
        const landlords = landlordRes.pagination?.totalItems ?? 0;
        const tenants = tenantRes.pagination?.totalItems ?? 0;
        const activePropCount = propsRes.pagination?.totalItems ?? 0;

        setTotalUsers(total);
        setLandlordCount(landlords);
        setTenantCount(tenants);
        setActiveProperties(activePropCount);

        const monthlyRes = await adminService.getMonthlySummary(activePropCount);
        setMonthly(monthlyRes.data);
      } catch (error) {
        console.error("Error cargando stats del admin:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchPendingVerifications = async () => {
      setIsVerificationsLoading(true);
      try {
        const res = await identityDocumentService.getAllDocuments("PENDING");
        if (res.data) {
          const formatted = res.data.map(doc => ({
            id: doc.id,
            user: doc.userName || doc.userEmail || "Usuario Desconocido",
            type: doc.userRole === "LANDLORD" || doc.userRole === "ROLE_LANDLORD" ? "Propietario" : "Inquilino",
            submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : "Recientemente"
          }));
          setPendingVerifications(formatted.slice(0, 3));
        }
      } catch (error) {
        console.error("Error cargando verificaciones pendientes:", error);
      } finally {
        setIsVerificationsLoading(false);
      }
    };

    fetchStats();
    fetchPendingVerifications();
  }, []);

  useEffect(() => {
    fetchUnreadNotificationsCount();
    const handleNotificationsUpdated = () => { fetchUnreadNotificationsCount(); };
    window.addEventListener("notifications-updated", handleNotificationsUpdated);
    return () => { window.removeEventListener("notifications-updated", handleNotificationsUpdated); };
  }, []);

  const statCards = [
    {
      label: "Usuarios Totales",
      value: totalUsers,
      icon: Users,
      color: "primary",
    },
    {
      label: "Propiedades Activas",
      value: activeProperties,
      icon: Building2,
      color: "green",
    },
    {
      label: "Reservas del Mes",
      value: monthly?.reservationsThisMonth ?? null,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "Ingresos del Mes",
      value: monthly
        ? `$${monthly.incomeThisMonth.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : null,
      icon: DollarSign,
      color: "orange",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", iconBg: "bg-primary/10", border: "border-t-primary" },
  green:   { bg: "bg-green-50",   text: "text-green-600", iconBg: "bg-green-100", border: "border-t-green-500" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",  iconBg: "bg-blue-100",  border: "border-t-blue-500" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-600", iconBg: "bg-orange-100", border: "border-t-orange-500" },
};

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-6 px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Bienvenido, Administrador
              </h1>
              <p className="text-muted-foreground mt-1">
                Aquí tienes un resumen del sistema RentFlow
              </p>
            </div>
            <Link href="/admin/notificaciones">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`border-t-4 ${colorClasses[stat.color].border} hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${colorClasses[stat.color].iconBg}`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${colorClasses[stat.color].text}`}
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      (stat.value ?? "-")
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <Card className="border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Verificaciones Pendientes
              </CardTitle>
              <Link href="/admin/verificaciones">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary"
                >
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isVerificationsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingVerifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">
                  No hay verificaciones pendientes
                </p>
              </div>
            ) : (
              pendingVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="p-2.5 bg-yellow-100 rounded-xl">
                    <FileCheck className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {verification.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {verification.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-2">
                      {verification.submittedAt}
                    </p>
                    <Link href={`/admin/verificaciones?search=${verification.id.split('-')[0]}`}>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 h-8"
                      >
                        Revisar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Critical Maintenance */}
        <Card className="border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Mantenimiento Crítico
              </CardTitle>
              <Link href="/admin/mantenimiento">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary"
                >
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {criticalMaintenance.length > 0 ? (
              <div className="space-y-3">
                {criticalMaintenance.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium text-foreground">
                        {maintenance.property}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 ml-11">
                      {maintenance.issue}
                    </p>
                    <div className="flex items-center gap-1 mt-2 ml-11">
                      <Clock className="w-3 h-3 text-red-500" />
                      <p className="text-xs text-red-500">
                        {maintenance.reportedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <Wrench className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">
                  No hay mantenimientos críticos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer h-full">
                    <div className="p-2.5 bg-primary/10 rounded-xl mb-3">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      {action.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Resumen del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-blue-600">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                ) : (
                  (landlordCount ?? "-")
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Propietarios</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-green-600">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-400" />
                ) : (
                  (tenantCount ?? "-")
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Inquilinos</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-purple-600">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                ) : monthly ? (
                  `${monthly.averageOccupation}%`
                ) : (
                  "-"
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tasa Ocupación
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}