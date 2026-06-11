'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Info, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Trash2,
  BellOff 
} from 'lucide-react'
import { mockNotifications, type Notification } from '@/lib/mock-data'

const typeIcons = {
  info: Info,
  remainder: Clock,
  maintenance: Wrench,
}

const typeColors = {
  info: 'bg-blue-100 text-blue-800',
  remainder: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-orange-100 text-orange-800',
}

const typeLabels = {
  info: 'Información',
  remainder: 'Recordatorio',
  maintenance: 'Mantenimiento',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = typeIcons[notification.type]
    return (
      <Card className={notification.read ? 'opacity-75' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              notification.type === 'info' ? 'bg-blue-100' :
              notification.type === 'remainder' ? 'bg-amber-100' : 'bg-orange-100'
            }`}>
              <Icon className={`h-5 w-5 ${
                notification.type === 'info' ? 'text-blue-600' :
                notification.type === 'remainder' ? 'text-amber-600' : 'text-orange-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                  <h4 className="font-medium">{notification.title}</h4>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[notification.type]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar leída
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
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadNotifications.length > 0 
              ? `Tienes ${unreadNotifications.length} notificación${unreadNotifications.length > 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones están leídas'
            }
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar todas como leídas
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
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BellOff className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">¡Estás al día!</h3>
                <p className="text-muted-foreground">No tienes notificaciones sin leer</p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">Sin notificaciones</h3>
                <p className="text-muted-foreground">No tienes notificaciones en este momento</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
