'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { 
  User, 
  Mail, 
  Phone, 
  Star, 
  Shield, 
  Edit, 
  Lock,
  CheckCircle2,
  CalendarDays,
  Home,
  FileCheck
} from 'lucide-react'
import { currentUser, mockReservations, mockIdentityDocument } from '@/lib/mock-data'

export default function ProfilePage() {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  })

  const totalReservations = mockReservations.length
  const completedReservations = mockReservations.filter(r => r.reservationStatus === 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                {mockIdentityDocument?.documentStatus === 'verified' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verificado
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Inquilino desde Enero 2026</p>
              <div className="mt-2 flex items-center justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{currentUser.averageRating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({currentUser.totalRatings} calificaciones)
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-1 h-4 w-4" /> Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-medium">{currentUser.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-4 text-center">
                <Home className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold">{totalReservations}</p>
                <p className="text-xs text-muted-foreground">Reservas Totales</p>
              </div>
              <div className="rounded-lg bg-secondary p-4 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold">{completedReservations}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
              <div className="rounded-lg bg-secondary p-4 text-center">
                <Star className="mx-auto h-6 w-6 text-amber-500" />
                <p className="mt-2 text-2xl font-bold">{currentUser.averageRating}</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
              <div className="rounded-lg bg-secondary p-4 text-center">
                <FileCheck className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-2 text-2xl font-bold">
                  {mockIdentityDocument?.documentStatus === 'verified' ? 'Sí' : 'No'}
                </p>
                <p className="text-xs text-muted-foreground">Verificado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Contraseña</p>
                  <p className="text-sm text-muted-foreground">Última actualización hace 3 meses</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                Cambiar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Verificación de Identidad</p>
                  <p className="text-sm text-muted-foreground">
                    {mockIdentityDocument?.documentStatus === 'verified' 
                      ? 'Documento verificado' 
                      : 'Pendiente de verificación'}
                  </p>
                </div>
              </div>
              <Badge className={mockIdentityDocument?.documentStatus === 'verified' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
              }>
                {mockIdentityDocument?.documentStatus === 'verified' ? 'Verificado' : 'Pendiente'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones por Email</p>
                <p className="text-sm text-muted-foreground">Recibir actualizaciones de reservas</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones SMS</p>
                <p className="text-sm text-muted-foreground">Alertas de acceso y recordatorios</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Idioma</p>
                <p className="text-sm text-muted-foreground">Español (ES)</p>
              </div>
              <Button variant="ghost" size="sm">Cambiar</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nombre Completo
              </Label>
              <Input
                className="mt-1"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Correo Electrónico
              </Label>
              <Input
                className="mt-1"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Teléfono de Contacto
              </Label>
              <Input
                className="mt-1"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña Actual
              </Label>
              <Input className="mt-1" type="password" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nueva Contraseña
              </Label>
              <Input className="mt-1" type="password" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confirmar Nueva Contraseña
              </Label>
              <Input className="mt-1" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button>
              Cambiar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
