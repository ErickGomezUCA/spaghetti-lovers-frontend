"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bell,
    Info,
    Clock,
    Wrench,
    CheckCircle2,
    Trash2,
    BellOff,
    Loader2,
} from "lucide-react"
import { notificationService } from "@/lib/services/notification.service"
import {
    NotificationResponse,
    NotificationType,
} from "@/types/api-responses"

const typeIcons: Record<NotificationType, React.ElementType> = {
    INFO: Info,
    REMINDER: Clock,
    MAINTENANCE: Wrench,
}

const typeColors: Record<NotificationType, string> = {
    INFO: "bg-blue-100 text-blue-800",
    REMINDER: "bg-amber-100 text-amber-800",
    MAINTENANCE: "bg-orange-100 text-orange-800",
}

const iconColors: Record<NotificationType, string> = {
    INFO: "text-blue-600",
    REMINDER: "text-amber-600",
    MAINTENANCE: "text-orange-600",
}

const typeLabels: Record<NotificationType, string> = {
    INFO: "Información",
    REMINDER: "Recordatorio",
    MAINTENANCE: "Mantenimiento",
}

const displayTitle = (title: string) => {
    const translations: Record<string, string> = {
        "Reservation Cancelled": "Reserva cancelada",
        "New Reservation": "Nueva reserva",
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

    const unreadNotifications = notifications.filter(
        (notification) => !notification.isRead,
    )

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await notificationService.markAsRead(notificationId);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? response.data : notification,
                ),
            );

            window.dispatchEvent(new Event("notifications-updated"));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            );

            window.dispatchEvent(new Event("notifications-updated"));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);

            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== notificationId),
            );

            window.dispatchEvent(new Event("notifications-updated"));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

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
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const NotificationCard = ({
                                  notification,
                              }: {
        notification: NotificationResponse
    }) => {
        const Icon = typeIcons[notification.type]

        return (
            <Card className={notification.isRead ? "opacity-75" : ""}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                typeColors[notification.type]
                            }`}
                        >
                            <Icon className={`h-5 w-5 ${iconColors[notification.type]}`} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    {!notification.isRead && (
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                    )}

                                    <h4 className="font-medium">
                                        {displayTitle(notification.title)}
                                    </h4>
                                </div>

                                <Badge variant="secondary" className="text-xs">
                                    {typeLabels[notification.type]}
                                </Badge>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {displayMessage(notification.message)}
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(notification.createdAt)}
                                </p>

                                <div className="flex gap-2">
                                    {!notification.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                            Marcar leída
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Notificaciones
                    </h1>

                    <p className="text-muted-foreground">
                        {unreadNotifications.length > 0
                            ? `Tienes ${unreadNotifications.length} notificación${
                                unreadNotifications.length > 1 ? "es" : ""
                            } sin leer`
                            : "Todas las notificaciones están leídas"}
                    </p>
                </div>

                {unreadNotifications.length > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            <Tabs defaultValue="unread" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unread">
                        Sin Leer ({unreadNotifications.length})
                    </TabsTrigger>

                    <TabsTrigger value="all">
                        Todas ({notifications.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unread" className="mt-4 space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    ) : unreadNotifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BellOff className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold">¡Estás al día!</h3>
                                <p className="text-muted-foreground">
                                    No tienes notificaciones sin leer
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        unreadNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="all" className="mt-4 space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    ) : notifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold">Sin notificaciones</h3>
                                <p className="text-muted-foreground">
                                    No tienes notificaciones en este momento
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}