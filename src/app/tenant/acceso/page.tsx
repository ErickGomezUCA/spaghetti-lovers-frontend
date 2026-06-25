'use client'

import { useEffect, useState } from 'react'
import { accessCodeService } from '@/lib/services/access-code.service'
import { AccessCodeDetailResponse } from '@/types/api-responses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Key,
    Copy,
    CheckCircle2,
    Clock,
    Home,
    CalendarDays,
    Eye,
    EyeOff,
    XCircle,
} from 'lucide-react'

export default function AccessCodesPage() {
    const [showCode, setShowCode] = useState<string | null>(null)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [accessCodes, setAccessCodes] = useState<AccessCodeDetailResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [codeError, setCodeError] = useState<string | null>(null)

    useEffect(() => {
        const loadAccessCodes = async () => {
            setIsLoading(true)
            setCodeError(null)

            try {
                const response = await accessCodeService.getTenantAccessCodes()
                setAccessCodes(response.data)
            } catch (error) {
                console.error('Error loading tenant access codes:', error)
                setCodeError('No se pudieron cargar los códigos de acceso.')
            } finally {
                setIsLoading(false)
            }
        }

        loadAccessCodes()
    }, [])

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const formatDate = (date: string) => {
        const dateOnly = date.split('T')[0]
        const [year, month, day] = dateOnly.split('-').map(Number)

        return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusBadge = (accessCode: AccessCodeDetailResponse) => {
        switch (accessCode.accessCodeStatus) {
            case 'ACTIVE':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Activo
                    </Badge>
                )

            case 'PENDING':
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Pendiente
                    </Badge>
                )

            case 'EXPIRED':
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Expirado
                    </Badge>
                )

            case 'INACTIVE':
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactivo
                    </Badge>
                )

            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        Desconocido
                    </Badge>
                )
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Códigos de Acceso
                </h1>
                <p className="text-muted-foreground">
                    Gestiona los códigos de acceso a tus propiedades reservadas
                </p>
            </div>

            {/* Info Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Key className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <h3 className="font-semibold">Sobre los Códigos de Acceso</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Los códigos de acceso son generados automáticamente al confirmar
                            tu reserva. Cada código es válido únicamente durante el período de
                            tu estadía y se desactiva al finalizar o cancelar la reserva.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {codeError && (
                <Card className="border-destructive/30 bg-destructive/10">
                    <CardContent className="p-4">
                        <p className="text-sm text-destructive">{codeError}</p>
                    </CardContent>
                </Card>
            )}

            {/* Access Codes List */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Key className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold">
                                Cargando códigos de acceso...
                            </h3>
                            <p className="text-muted-foreground">
                                Estamos obteniendo tus códigos desde el backend.
                            </p>
                        </CardContent>
                    </Card>
                ) : accessCodes.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Key className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold">
                                No tienes códigos de acceso activos
                            </h3>
                            <p className="text-muted-foreground">
                                Los códigos se generan al confirmar una reserva
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    accessCodes.map((accessCode) => {
                        const isVisible = showCode === accessCode.accessCodeId

                        return (
                            <Card key={accessCode.accessCodeId}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                                                <Home className="h-6 w-6 text-primary" />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold">
                                                    {accessCode.propertyTitle}
                                                </h3>

                                                <p className="text-sm text-muted-foreground">
                                                    {accessCode.propertyCity},{' '}
                                                    {accessCode.propertyDepartment}
                                                </p>

                                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                              {formatDate(accessCode.checkInDate)} -{' '}
                              {formatDate(accessCode.checkOutDate)}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(accessCode)}

                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-secondary px-4 py-2">
                          <span className="font-mono text-lg font-bold">
                            {isVisible ? accessCode.code : '• • • • • •'}
                          </span>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setShowCode(
                                                            isVisible ? null : accessCode.accessCodeId,
                                                        )
                                                    }
                                                >
                                                    {isVisible ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={!accessCode.code}
                                                    onClick={() => handleCopyCode(accessCode.code)}
                                                >
                                                    {copiedCode === accessCode.code ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>

                                            {accessCode.accessCodeStatus === 'PENDING' && (
                                                <p className="text-xs text-muted-foreground">
                                                    Válido desde el {formatDate(accessCode.validFrom)}
                                                </p>
                                            )}

                                            {accessCode.accessCodeStatus === 'EXPIRED' && (
                                                <p className="text-xs text-muted-foreground">
                                                    Expiró el {formatDate(accessCode.validUntil)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Instructions Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Instrucciones de Uso</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            1
                        </div>
                        <div>
                            <p className="font-medium">Verifica la validez</p>
                            <p className="text-sm text-muted-foreground">
                                Asegúrate de que el código esté activo antes de intentar usarlo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            2
                        </div>
                        <div>
                            <p className="font-medium">Ingresa el código</p>
                            <p className="text-sm text-muted-foreground">
                                Introduce el código en el teclado numérico de la cerradura o en
                                la aplicación de acceso.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            3
                        </div>
                        <div>
                            <p className="font-medium">Mantén el código seguro</p>
                            <p className="text-sm text-muted-foreground">
                                No compartas tu código con personas no autorizadas. El código es
                                personal y está vinculado a tu reserva.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            4
                        </div>
                        <div>
                            <p className="font-medium">¿Problemas de acceso?</p>
                            <p className="text-sm text-muted-foreground">
                                Si tienes dificultades para ingresar, contacta al propietario o
                                al soporte de RentFlow disponible 24/7.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}