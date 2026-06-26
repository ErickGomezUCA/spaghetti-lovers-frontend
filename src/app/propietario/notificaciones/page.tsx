"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    Wrench,
    CheckCircle,
    Info,
    Trash2,
    Loader2,
} from "lucide-react"
import { notificationService } from "@/lib/services/notification.service"
import {
    NotificationResponse,
    NotificationType,
} from "@/types/api-responses"

const typeIcons: Record<NotificationType, ReactNode> = {
    INFO: <Info className="h-5 w-5" />,
    REMINDER: <Bell className="h-5 w-5" />,
    MAINTENANCE: <Wrench className="h-5 w-5" />,
}

const typeColors: Record<NotificationType, string> = {
    INFO: "bg-blue-100 text-blue-600",
    REMINDER: "bg-purple-100 text-purple-600",
    MAINTENANCE: "bg-orange-100 text-orange-600",
}

const typeLabels: Record<NotificationType, string> = {
    INFO: "Información",
    REMINDER: "Recordatorio",
    MAINTENANCE: "Mantenimiento",
}

const displayTitle = (title: string) => {
    const translations: Record<string, string> = {
        "Reservation Cancelled": "Reserva cancelada",
        "New Reservation": "Nueva reserva recibida",
    }

    return translations[title] ?? title
}

const displayMessage = (message: string) => {
    const translations: Record<string, string> = {
        "The reservation has been cancelled.":
            "La reserva ha sido cancelada.",
        "You have a new reservation for your property.":
            "Tienes una nueva reserva para una de tus propiedades.",
    }

    return translations[message] ?? message
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all")
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        setIsLoading(true)

        try {
            const response = await notificationService.getNotifications()
            setNotifications(response.data)
        } catch (error) {
            console.error("Error loading notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "all") return true
        if (filter === "unread") return !notification.isRead
        return notification.type === filter
    })

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead,
    ).length

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await notificationService.markAsRead(notificationId)

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? response.data
                        : notification,
                ),
            )
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            )
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId)

            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== notificationId),
            )
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
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

        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Notificaciones
                    </h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0
                            ? `Tienes ${unreadCount} notificación${
                                unreadCount > 1 ? "es" : ""
                            } sin leer`
                            : "Todas las notificaciones leídas"}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardContent className="p-4">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full bg-input md:w-56">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las notificaciones</SelectItem>
                            <SelectItem value="unread">
                                Sin leer ({unreadCount})
                            </SelectItem>
                            <SelectItem value="INFO">Información</SelectItem>
                            <SelectItem value="REMINDER">Recordatorios</SelectItem>
                            <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {isLoading ? (
                    <Card className="border-t-4 border-t-primary">
                        <CardContent className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </CardContent>
                    </Card>
                ) : filteredNotifications.length === 0 ? (
                    <Card className="border-t-4 border-t-primary">
                        <CardContent className="p-8 text-center">
                            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                                No hay notificaciones
                            </h3>
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
                                notification.isRead
                                    ? "border-t-gray-300"
                                    : "border-t-primary bg-primary/5"
                            }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`rounded-lg p-2 ${
                                            typeColors[notification.type]
                                        }`}
                                    >
                                        {typeIcons[notification.type]}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">
                                                        {displayTitle(notification.title)}
                                                    </h4>

                                                    {!notification.isRead && (
                                                        <Badge className="bg-primary text-xs text-primary-foreground">
                                                            Nueva
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {displayMessage(notification.message)}
                                                </p>

                                                <div className="mt-2 flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>

                                                    <Badge variant="outline" className="text-xs">
                                                        {typeLabels[notification.type]}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deleteNotification(notification.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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