"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Calendar,
  FileText,
  Wrench,
  DollarSign,
  CheckCircle,
  Info,
  AlertTriangle,
  Trash2,
} from "lucide-react"

// Mock data
const notifications = [
  {
    id: "NOT-001",
    type: "info",
    title: "Nueva reserva recibida",
    message: "María García ha realizado una reserva para Apartamento Centro Histórico del 15 al 20 de Junio.",
    reservationId: "RES-001",
    createdAt: "2024-06-10T10:30:00",
    read: false,
  },
  {
    id: "NOT-002",
    type: "info",
    title: "Contrato firmado",
    message: "El contrato CTR-001 ha sido firmado por ambas partes.",
    reservationId: "RES-001",
    createdAt: "2024-06-10T16:45:00",
    read: false,
  },
  {
    id: "NOT-003",
    type: "maintenance",
    title: "Solicitud de mantenimiento crítico",
    message: "Se ha reportado un problema urgente en Loft Moderno: Fuga en el baño.",
    maintenanceId: "MNT-003",
    createdAt: "2024-05-15T08:00:00",
    read: true,
  },
  {
    id: "NOT-004",
    type: "info",
    title: "Pago de reserva confirmado",
    message: "El pago de $575.00 para la reserva RES-001 ha sido confirmado.",
    reservationId: "RES-001",
    createdAt: "2024-06-10T11:00:00",
    read: true,
  },
  {
    id: "NOT-005",
    type: "remainder",
    title: "Recordatorio: Checkout mañana",
    message: "La reserva RES-003 tiene checkout programado para mañana. Recuerda confirmar la inspección.",
    reservationId: "RES-003",
    createdAt: "2024-05-29T09:00:00",
    read: true,
  },
  {
    id: "NOT-006",
    type: "info",
    title: "Nueva calificación recibida",
    message: "Ana Martínez te ha calificado con 5 estrellas. ¡Excelente trabajo!",
    createdAt: "2024-06-01T14:00:00",
    read: true,
  },
]

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="w-5 h-5" />,
  remainder: <Bell className="w-5 h-5" />,
  maintenance: <Wrench className="w-5 h-5" />,
}

const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-600",
  remainder: "bg-purple-100 text-purple-600",
  maintenance: "bg-orange-100 text-orange-600",
}

const typeLabels: Record<string, string> = {
  info: "Información",
  remainder: "Recordatorio",
  maintenance: "Mantenimiento",
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all")
  const [notificationList, setNotificationList] = useState(notifications)

  const filteredNotifications = notificationList.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotificationList(
      notificationList.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotificationList(notificationList.filter((n) => n.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return "Hace menos de una hora"
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
    if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`
    return date.toLocaleDateString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
              : "Todas las notificaciones leídas"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-56 bg-input">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las notificaciones</SelectItem>
                <SelectItem value="unread">Sin leer ({unreadCount})</SelectItem>
                <SelectItem value="info">Información</SelectItem>
                <SelectItem value="remainder">Recordatorios</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="border-t-4 border-t-primary">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer."
                  : "No hay notificaciones que mostrar con este filtro."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-t-4 ${
                notification.read ? "border-t-gray-300" : "border-t-primary"
              } ${!notification.read ? "bg-primary/5" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Nueva
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[notification.type]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
