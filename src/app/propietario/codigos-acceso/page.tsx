"use client"

import { useEffect, useState } from "react"
import { accessCodeService } from "@/lib/services/access-code.service"
import { AccessCodeDetailResponse } from "@/types/api-responses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Key,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

const codeTypeLabels: Record<string, string> = {
    ACCESS_CODE: "Código de Acceso",
    RECOVERY_CODE: "Código de Recuperación",
}

const codeTypeColors: Record<string, string> = {
    ACCESS_CODE: "bg-blue-100 text-blue-700 border-blue-200",
    RECOVERY_CODE: "bg-purple-100 text-purple-700 border-purple-200",
}

export default function AccessCodesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [accessCodes, setAccessCodes] = useState<AccessCodeDetailResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
      const loadLandlordAccessCodes = async () => {
          setIsLoading(true)
          setError(null)

          try {
              const response = await accessCodeService.getLandlordAccessCodes()
              setAccessCodes(response.data)
          } catch (error) {
              console.error("Error loading landlord access codes:", error)
              setError("No se pudieron cargar los códigos de acceso.")
          } finally {
              setIsLoading(false)
          }
      }

      loadLandlordAccessCodes()
  }, [])


    const filteredCodes = accessCodes.filter((code) => {
        const search = searchTerm.toLowerCase()

        const matchesSearch =
            code.propertyTitle.toLowerCase().includes(search) ||
            code.tenantName.toLowerCase().includes(search) ||
            code.reservationId.toLowerCase().includes(search)

        const matchesStatus =
            statusFilter === "all" ||
            code.accessCodeStatus === statusFilter

        return matchesSearch && matchesStatus
    })

  const toggleCodeVisibility = (codeId: string) => {
    const newVisible = new Set(visibleCodes)
    if (newVisible.has(codeId)) {
      newVisible.delete(codeId)
    } else {
      newVisible.add(codeId)
    }
    setVisibleCodes(newVisible)
  }

  const copyCode = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(codeId)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      ACTIVE: {
          label: "Activo",
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle className="w-3 h-3" />,
      },
      PENDING: {
          label: "Pendiente",
          color: "bg-blue-100 text-blue-700",
          icon: <Clock className="w-3 h-3" />,
      },
      EXPIRED: {
          label: "Expirado",
          color: "bg-gray-100 text-gray-700",
          icon: <XCircle className="w-3 h-3" />,
      },
      INACTIVE: {
          label: "Inactivo",
          color: "bg-red-100 text-red-700",
          icon: <XCircle className="w-3 h-3" />,
      },
  }

  const formatDate = (date: string) => {
        const dateOnly = date.split("T")[0]
        const [year, month, day] = dateOnly.split("-").map(Number)

        return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    const formatReservationId = (reservationId: string) => {
        return `RES-${reservationId.slice(0, 8).toUpperCase()}`
    }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Códigos de Acceso</h1>
          <p className="text-muted-foreground">Gestiona los códigos temporales de acceso a tus propiedades</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Códigos automáticos</p>
              <p className="text-sm text-blue-600">
                Los códigos de acceso se generan automáticamente al confirmar una reserva.
                Cada reserva incluye un código de acceso principal y un código de recuperación (solo visible para ti).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
                {accessCodes.filter((c) => c.accessCodeStatus === "ACTIVE").length}
            </p>
            <p className="text-sm text-muted-foreground">Activos ahora</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
                {accessCodes.filter((code) => code.codeType === "ACCESS_CODE").length}
            </p>
            <p className="text-sm text-muted-foreground">Códigos de acceso</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-purple-600">
                {accessCodes.filter((code) => code.codeType === "RECOVERY_CODE").length}
            </p>
            <p className="text-sm text-muted-foreground">Códigos de recuperación</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-600">
              {accessCodes.filter((c) => !c.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Inactivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por propiedad, inquilino o reserva..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="EXPIRED">Expirados</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Access Codes Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Inquilino</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Válido desde</TableHead>
                <TableHead>Válido hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((code) => {
                const status = code.accessCodeStatus
                const info = statusInfo[code.accessCodeStatus] ?? statusInfo.INACTIVE
                return (
                  <TableRow key={code.accessCodeId}>
                    <TableCell className="font-medium"> {formatReservationId(code.reservationId)} </TableCell>
                    <TableCell className="max-w-[150px] truncate">{code.propertyTitle}</TableCell>
                    <TableCell>{code.tenantName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={codeTypeColors[code.codeType]}>
                        {codeTypeLabels[code.codeType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-lg bg-muted px-2 py-1 rounded">
                          {visibleCodes.has(code.accessCodeId) ? code.code : "••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleCodeVisibility(code.accessCodeId)}
                        >
                          {visibleCodes.has(code.accessCodeId) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(code.validFrom)}</TableCell>
                    <TableCell>{formatDate(code.validUntil)}</TableCell>
                    <TableCell>
                      <Badge className={info.color}>
                        <span className="flex items-center gap-1">
                          {info.icon}
                          {info.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyCode(code.code, code.accessCodeId)}
                        >
                          {copiedCode === code.accessCodeId ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
