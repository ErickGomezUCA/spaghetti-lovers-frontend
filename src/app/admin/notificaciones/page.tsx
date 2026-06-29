"use client"

import { useEffect, useState } from "react"
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
    Loader2,
} from "lucide-react"
import { notificationService } from "@/lib/services/notification.service"
import {
    NotificationResponse,
    NotificationType,
} from "@/types/api-responses"

const typeConfig: Record<
    NotificationType,
    { icon: typeof Bell; color: string; bgColor: string; label: string }
> = {
    INFO: {
        icon: Info,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Informativa",
    },
    REMINDER: {
        icon: Calendar,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        label: "Recordatorio",
    },
    MAINTENANCE: {
        icon: Wrench,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Mantenimiento",
    },
}

const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return "Hace un momento"
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
    if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`

    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [filter, setFilter] = useState<"all" | "unread">("all")
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 10

    const fetchNotifications = async (currentPage = page) => {
        setIsLoading(true)

        try {
            const response = await notificationService.getNotifications(
                filter === "unread",
                currentPage,
                pageSize,
                "createdAt",
                "desc",
            )

            setNotifications(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error("Error cargando notificaciones del admin:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications(page)
    }, [page, filter])

    const filteredNotifications = notifications.filter((notification) =>
        filter === "all" ? true : !notification.isRead,
    )

    const unreadCount = notifications.filter((notification) => !notification.isRead).length

    const unreadMaintenanceCount = notifications.filter(
        (notification) =>
            notification.type === "MAINTENANCE" && !notification.isRead,
    ).length

    const unreadInfoCount = notifications.filter(
        (notification) => notification.type === "INFO" && !notification.isRead,
    ).length

    const unreadReminderCount = notifications.filter(
        (notification) =>
            notification.type === "REMINDER" && !notification.isRead,
    ).length

    const markAsRead = async (id: string) => {
        try {
            const response = await notificationService.markAsRead(id)

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id ? response.data : notification,
                ),
            )

            window.dispatchEvent(new Event("notifications-updated"))
        } catch (error) {
            console.error("Error marcando notificación como leída:", error)
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

            window.dispatchEvent(new Event("notifications-updated"))
        } catch (error) {
            console.error("Error marcando todas como leídas:", error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await notificationService.deleteNotification(id)

            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id),
            )

            window.dispatchEvent(new Event("notifications-updated"))
        } catch (error) {
            console.error("Error eliminando notificación:", error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Notificaciones
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {unreadCount > 0
                            ? `${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
                            : "Todas las notificaciones leídas"}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => {
                            setPage(0)
                            setFilter("all")
                        }}
                    >
                        Todas
                    </Button>

                    <Button
                        variant={filter === "unread" ? "default" : "outline"}
                        onClick={() => {
                            setPage(0)
                            setFilter("unread")
                        }}
                    >
                        Sin leer ({unreadCount})
                    </Button>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marcar todas
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-t-4 border-t-red-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Mantenimiento</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {unreadMaintenanceCount}
                                </p>
                            </div>
                            <Wrench className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-blue-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Informativas</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {unreadInfoCount}
                                </p>
                            </div>
                            <Info className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-orange-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Recordatorios</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {unreadReminderCount}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {filter === "all"
                            ? "Todas las Notificaciones"
                            : "Notificaciones Sin Leer"}{" "}
                        ({filteredNotifications.length})
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification) => {
                                const config = typeConfig[notification.type] ?? typeConfig.INFO
                                const TypeIcon = config.icon

                                return (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                                            notification.isRead
                                                ? "border-border bg-background"
                                                : "border-primary/30 bg-primary/5"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}
                                        >
                                            <TypeIcon className={`h-5 w-5 ${config.color}`} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3
                                                        className={`font-medium ${
                                                            notification.isRead
                                                                ? "text-muted-foreground"
                                                                : "text-foreground"
                                                        }`}
                                                    >
                                                        {notification.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {notification.message}
                                                    </p>
                                                </div>

                                                {!notification.isRead && (
                                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationDate(notification.createdAt)}
                        </span>

                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {notification.type === "MAINTENANCE" ? (
                              <Wrench className="h-3 w-3" />
                          ) : notification.type === "REMINDER" ? (
                              <Calendar className="h-3 w-3" />
                          ) : (
                              <User className="h-3 w-3" />
                          )}
                                                    {config.label}
                        </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Marcar como leída"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-muted-foreground hover:text-destructive"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}

                            {filteredNotifications.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                    <p>
                                        {filter === "unread"
                                            ? "No hay notificaciones sin leer"
                                            : "No hay notificaciones"}
                                    </p>
                                </div>
                            )}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Página {page + 1} de {totalPages}
                                    </p>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={page === 0 || isLoading}
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                        >
                                            Anterior
                                        </Button>

                                        <Button
                                            variant="outline"
                                            disabled={page + 1 >= totalPages || isLoading}
                                            onClick={() => setPage((prev) => prev + 1)}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}