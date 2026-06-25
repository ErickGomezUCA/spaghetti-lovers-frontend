'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  FileText,
  Shield
} from 'lucide-react'
import { mockIdentityDocument } from '@/lib/mock-data'

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'En Revisión',
  verified: 'Verificado',
  rejected: 'Rechazado',
}

const statusIcons = {
  pending: Clock,
  verified: CheckCircle2,
  rejected: XCircle,
}

export default function DocumentsPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const document = mockIdentityDocument

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verificación de Identidad</h1>
        <p className="text-muted-foreground">Sube tu documento de identidad para verificar tu cuenta</p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">¿Por qué verificar tu identidad?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              La verificación de identidad es requerida para mantener la seguridad de la comunidad RentFlow. 
              Tu documento será revisado por nuestro equipo y la información será tratada de forma confidencial.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          {document ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${
                  document.documentStatus === 'verified' ? 'bg-green-100' :
                  document.documentStatus === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  {(() => {
                    const Icon = statusIcons[document.documentStatus]
                    return <Icon className={`h-7 w-7 ${
                      document.documentStatus === 'verified' ? 'text-green-600' :
                      document.documentStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Documento de Identidad</h3>
                    <Badge className={statusColors[document.documentStatus]}>
                      {statusLabels[document.documentStatus]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subido el {new Date(document.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {document.documentStatus === 'verified' && (
                    <p className="mt-1 text-sm text-green-600">
                      ¡Tu identidad ha sido verificada exitosamente!
                    </p>
                  )}
                  {document.documentStatus === 'rejected' && (
                    <p className="mt-1 text-sm text-red-600">
                      Tu documento fue rechazado. Por favor, sube uno nuevo.
                    </p>
                  )}
                  {document.documentStatus === 'pending' && (
                    <p className="mt-1 text-sm text-amber-600">
                      Tu documento está siendo revisado. Este proceso puede tomar hasta 48 horas.
                    </p>
                  )}
                </div>
              </div>
              {document.documentStatus !== 'pending' && (
                <Button 
                  variant={document.documentStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="mr-1 h-4 w-4" />
                  {document.documentStatus === 'rejected' ? 'Subir Nuevo' : 'Actualizar'}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FileCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No has subido tu documento</h3>
              <p className="text-center text-muted-foreground max-w-md">
                Para completar tu verificación, necesitas subir una foto o escaneo de tu documento de identidad.
              </p>
              <Button className="mt-4" onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-1 h-4 w-4" /> Subir Documento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accepted Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Aceptados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">DUI</h4>
              <p className="text-sm text-muted-foreground">
                Documento Único de Identidad (El Salvador)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">Pasaporte</h4>
              <p className="text-sm text-muted-foreground">
                Pasaporte vigente de cualquier país
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">Licencia</h4>
              <p className="text-sm text-muted-foreground">
                Licencia de conducir vigente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requisitos del Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">La imagen debe ser clara y legible, sin reflejos ni sombras</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Todos los bordes del documento deben ser visibles</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">El documento debe estar vigente (no expirado)</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Formatos aceptados: JPG, PNG o PDF (máximo 10MB)</p>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm">No se aceptan fotos de pantalla o capturas del documento</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Documento de Identidad</DialogTitle>
            <DialogDescription>
              Sube una foto o escaneo de tu documento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Archivo del Documento
              </Label>
              <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG o PDF (máximo 10MB)
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Seleccionar Archivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Tu documento será almacenado de forma segura y solo será utilizado para verificar 
                  tu identidad. Cumplimos con todas las regulaciones de protección de datos.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
            <Button>
              <Upload className="mr-1 h-4 w-4" /> Subir Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
