"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  Wrench,
  Calendar,
  User,
  Building2,
  Trash2,
} from "lucide-react"

type NotificationType = "info" | "remainder" | "maintenance"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  relatedEntity?: {
    type: "reservation" | "maintenance" | "user" | "property"
    id: string
    name: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "maintenance",
    title: "Mantenimiento Critico",
    message: "Nueva solicitud de mantenimiento critico en Apartamento Vista al Mar - Fuga de agua reportada",
    createdAt: "2024-02-15 14:30",
    read: false,
    relatedEntity: { type: "maintenance", id: "MNT-001", name: "Fuga de agua" },
  },
  {
    id: "2",
    type: "info",
    title: "Nueva Verificacion Pendiente",
    message: "Juan Perez ha subido su documento de identidad para verificacion",
    createdAt: "2024-02-15 12:00",
    read: false,
    relatedEntity: { type: "user", id: "USR-001", name: "Juan Perez" },
  },
  {
    id: "3",
    type: "maintenance",
    title: "Mantenimiento de Alta Prioridad",
    message: "Solicitud de mantenimiento con prioridad alta en Casa de Playa - Aire acondicionado no funciona",
    createdAt: "2024-02-14 16:45",
    read: true,
    relatedEntity: { type: "maintenance", id: "MNT-002", name: "Aire acondicionado" },
  },
  {
    id: "4",
    type: "info",
    title: "Nuevo Usuario Registrado",
    message: "Maria Lopez se ha registrado como inquilino en la plataforma",
    createdAt: "2024-02-14 10:20",
    read: true,
    relatedEntity: { type: "user", id: "USR-002", name: "Maria Lopez" },
  },
  {
    id: "5",
    type: "remainder",
    title: "Recordatorio de Verificaciones",
    message: "Hay 3 documentos de identidad pendientes de verificacion desde hace mas de 48 horas",
    createdAt: "2024-02-13 09:00",
    read: true,
  },
]

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
  info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-100" },
  remainder: { icon: Calendar, color: "text-orange-600", bgColor: "bg-orange-100" },
  maintenance: { icon: Wrench, color: "text-red-600", bgColor: "bg-red-100" },
}

const entityIcons = {
  reservation: Calendar,
  maintenance: Wrench,
  user: User,
  property: Building2,
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : "Todas las notificaciones leidas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Sin leer ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mantenimiento</p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.type === "maintenance" && !n.read).length}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Informativas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter((n) => n.type === "info" && !n.read).length}
                </p>
              </div>
              <Info className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recordatorios</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter((n) => n.type === "remainder" && !n.read).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filter === "all" ? "Todas las Notificaciones" : "Notificaciones Sin Leer"} ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = typeConfig[notification.type]
              const TypeIcon = config.icon
              const EntityIcon = notification.relatedEntity
                ? entityIcons[notification.relatedEntity.type]
                : null

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? "border-border bg-background"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-muted-foreground">{notification.createdAt}</span>
                      {notification.relatedEntity && EntityIcon && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <EntityIcon className="w-3 h-3" />
                          {notification.relatedEntity.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como leida"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{filter === "unread" ? "No hay notificaciones sin leer" : "No hay notificaciones"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
