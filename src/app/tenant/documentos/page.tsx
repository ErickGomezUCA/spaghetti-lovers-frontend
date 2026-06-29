"use client"

import { useState, useEffect, useCallback } from 'react'
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
  Shield,
  Loader2,
  FileImage
} from 'lucide-react'

// Asegúrate de importar tu servicio de subida aquí
import { uploadService } from '@/lib/services/upload.service' 
import { identityDocumentService } from '@/lib/services/identity-document.service'
import { DocumentStatus, IdentityDocumentResponse } from "@/types/api-responses"

const statusColors: Record<DocumentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<DocumentStatus, string> = {
  PENDING: 'En Revisión',
  VERIFIED: 'Verificado',
  REJECTED: 'Rechazado',
}

const statusIcons: Record<DocumentStatus, React.ElementType> = {
  PENDING: Clock,
  VERIFIED: CheckCircle2,
  REJECTED: XCircle,
}

export default function DocumentsPage() {
  const [document, setDocument] = useState<IdentityDocumentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados del Modal y Subida
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false) // Para Cloudinary
  const [isSubmitting, setIsSubmitting] = useState(false) // Para Spring Boot
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Aquí guardaremos la URL que nos devuelve Cloudinary
  const [tempUploadedUrl, setTempUploadedUrl] = useState<string>("")
  const [fileName, setFileName] = useState<string>("") // Solo visual para el usuario

  const fetchMyDocument = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await identityDocumentService.getMyDocument()
      setDocument(res.data || null)
    } catch (error) {
      console.error("Error cargando el documento:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyDocument()
  }, [fetchMyDocument])

  // LÓGICA 1: Subir a Cloudinary cuando se selecciona el archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      // Reutilizamos tu uploadService tal como lo haces en propiedades
      const result = await uploadService.uploadImage(file);
      
      // Guardamos la URL en el estado
      setTempUploadedUrl(result.data.url);
    } catch (err: any) {
      console.error("Error subiendo el archivo:", err);
      setUploadError(err.message || "Error al subir el archivo. Intenta de nuevo.");
      setFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  // LÓGICA 2: Enviar URL a Spring Boot al darle "Enviar"
  const handleSubmitDocument = async () => {
    if (!tempUploadedUrl) {
      setUploadError("Por favor selecciona y sube un archivo primero.")
      return
    }

    setIsSubmitting(true)
    setUploadError(null)
    try {
      // Llamamos al endpoint de identity-documents con la URL del state
      await identityDocumentService.submitDocument(tempUploadedUrl)
      
      // Limpiamos todo y cerramos
      setShowUploadDialog(false)
      setTempUploadedUrl("")
      setFileName("")
      
      // Refrescamos la UI
      fetchMyDocument() 
    } catch (error: any) {
      console.error("Error al registrar el documento:", error)
      setUploadError(error?.response?.data?.message || "Ocurrió un error al procesar tu solicitud.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetUploadState = (open: boolean) => {
    setShowUploadDialog(open);
    if (!open) {
      setTempUploadedUrl("");
      setFileName("");
      setUploadError(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verificación de Identidad</h1>
        <p className="text-muted-foreground">Sube tu documento de identidad para verificar tu cuenta</p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">¿Por qué verificar tu identidad?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              La verificación de identidad es requerida para mantener la seguridad de la comunidad. 
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
                <div className={`flex h-14 w-14 items-center justify-center rounded-lg shrink-0 ${
                  document.documentStatus === 'VERIFIED' ? 'bg-green-100' :
                  document.documentStatus === 'REJECTED' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  {(() => {
                    const Icon = statusIcons[document.documentStatus]
                    return <Icon className={`h-7 w-7 ${
                      document.documentStatus === 'VERIFIED' ? 'text-green-600' :
                      document.documentStatus === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Documento de Identidad</h3>
                    <Badge className={`${statusColors[document.documentStatus]} border-none`}>
                      {statusLabels[document.documentStatus]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subido el {document.submittedAt ? new Date(document.submittedAt).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : "Recientemente"}
                  </p>
                  
                  {document.documentStatus === 'VERIFIED' && (
                    <p className="mt-1 text-sm text-green-600 font-medium">
                      ¡Tu identidad ha sido verificada exitosamente! Ya puedes operar sin restricciones.
                    </p>
                  )}
                  {document.documentStatus === 'REJECTED' && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600 font-medium">
                        Tu documento fue rechazado. Por favor, sube uno nuevo.
                      </p>
                      {document.rejectionReason && (
                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100 mt-1">
                          <strong>Motivo:</strong> {document.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                  {document.documentStatus === 'PENDING' && (
                    <p className="mt-1 text-sm text-amber-600 font-medium">
                      Tu documento está siendo revisado. Este proceso puede tomar hasta 48 horas.
                    </p>
                  )}
                </div>
              </div>
              {document.documentStatus === 'REJECTED' && (
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="mr-1 h-4 w-4" /> Subir Nuevo Documento
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

      {/* Accepted Documents (Omitido por brevedad, es el mismo tuyo) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Aceptados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div>
              <h4 className="font-medium">DUI</h4>
              <p className="text-sm text-muted-foreground">Documento Único de Identidad (El Salvador)</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div>
              <h4 className="font-medium">Pasaporte</h4>
              <p className="text-sm text-muted-foreground">Pasaporte vigente de cualquier país</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div>
              <h4 className="font-medium">Licencia</h4>
              <p className="text-sm text-muted-foreground">Licencia de conducir vigente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={resetUploadState}>
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
              
              {/* Contenedor de Upload */}
              <div className="mt-2">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept="image/jpeg, image/png, application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploading || isSubmitting}
                />
                
                <Label
                  htmlFor="document-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${tempUploadedUrl ? 'border-green-500 bg-green-50/50' : 'border-border hover:bg-muted/50'}
                    ${(isUploading || isSubmitting) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Subiendo a la nube...</p>
                      </>
                    ) : tempUploadedUrl ? (
                      <>
                        <FileImage className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{fileName}</p>
                        <p className="text-xs text-green-600 mt-1">¡Archivo listo para enviar!</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Haz clic aquí para seleccionar</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG o PDF (máx. 10MB)</p>
                      </>
                    )}
                  </div>
                </Label>
              </div>
            </div>

            {uploadError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex gap-2 items-start">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{uploadError}</p>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Tu documento será almacenado de forma segura y solo será utilizado para verificar 
                  tu identidad. Cumplimos con todas las regulaciones de protección de datos.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => resetUploadState(false)} disabled={isUploading || isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitDocument} disabled={!tempUploadedUrl || isUploading || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><FileCheck className="mr-1 h-4 w-4" /> Enviar para Revisión</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}