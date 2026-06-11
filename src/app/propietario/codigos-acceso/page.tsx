"use client"

import { useState } from "react"
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
  RefreshCw,
} from "lucide-react"

// Mock data
const accessCodes = [
  {
    id: "ACC-001",
    reservationId: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    code: "A7X9K2",
    codeType: "access_code",
    validFrom: "2024-06-15",
    validUntil: "2024-06-20",
    isActive: true,
    createdAt: "2024-06-10",
  },
  {
    id: "ACC-002",
    reservationId: "RES-001",
    property: "Apartamento Centro Histórico",
    tenant: "María García",
    code: "R3M8P5",
    codeType: "recovery_code",
    validFrom: "2024-06-15",
    validUntil: "2024-06-20",
    isActive: true,
    createdAt: "2024-06-10",
  },
  {
    id: "ACC-003",
    reservationId: "RES-002",
    property: "Casa de Playa Costa del Sol",
    tenant: "Carlos López",
    code: "B4Y6L1",
    codeType: "access_code",
    validFrom: "2024-06-18",
    validUntil: "2024-06-25",
    isActive: true,
    createdAt: "2024-06-08",
  },
  {
    id: "ACC-004",
    reservationId: "RES-003",
    property: "Loft Moderno Zona Rosa",
    tenant: "Ana Martínez",
    code: "C2Z5N8",
    codeType: "access_code",
    validFrom: "2024-05-01",
    validUntil: "2024-05-30",
    isActive: false,
    createdAt: "2024-04-20",
  },
]

const codeTypeLabels: Record<string, string> = {
  access_code: "Código de Acceso",
  recovery_code: "Código de Recuperación",
}

const codeTypeColors: Record<string, string> = {
  access_code: "bg-blue-100 text-blue-700 border-blue-200",
  recovery_code: "bg-purple-100 text-purple-700 border-purple-200",
}

export default function AccessCodesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filteredCodes = accessCodes.filter((code) => {
    const matchesSearch =
      code.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.reservationId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && code.isActive) ||
      (statusFilter === "inactive" && !code.isActive)
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

  const isCodeValid = (validFrom: string, validUntil: string) => {
    const now = new Date()
    const from = new Date(validFrom)
    const until = new Date(validUntil)
    return now >= from && now <= until
  }

  const getCodeStatus = (code: typeof accessCodes[0]) => {
    if (!code.isActive) return "inactive"
    if (isCodeValid(code.validFrom, code.validUntil)) return "valid"
    if (new Date() < new Date(code.validFrom)) return "pending"
    return "expired"
  }

  const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    valid: { label: "Válido", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
    pending: { label: "Pendiente", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3 h-3" /> },
    expired: { label: "Expirado", color: "bg-gray-100 text-gray-700", icon: <XCircle className="w-3 h-3" /> },
    inactive: { label: "Inactivo", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
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
              {accessCodes.filter((c) => c.isActive && isCodeValid(c.validFrom, c.validUntil)).length}
            </p>
            <p className="text-sm text-muted-foreground">Activos ahora</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {accessCodes.filter((c) => c.codeType === "access_code").length}
            </p>
            <p className="text-sm text-muted-foreground">Códigos de acceso</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-purple-600">
              {accessCodes.filter((c) => c.codeType === "recovery_code").length}
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
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
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
                const status = getCodeStatus(code)
                const info = statusInfo[status]
                return (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.reservationId}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{code.property}</TableCell>
                    <TableCell>{code.tenant}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={codeTypeColors[code.codeType]}>
                        {codeTypeLabels[code.codeType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-lg bg-muted px-2 py-1 rounded">
                          {visibleCodes.has(code.id) ? code.code : "••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleCodeVisibility(code.id)}
                        >
                          {visibleCodes.has(code.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{code.validFrom}</TableCell>
                    <TableCell>{code.validUntil}</TableCell>
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
                          onClick={() => copyCode(code.code, code.id)}
                        >
                          {copiedCode === code.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {code.isActive && status === "valid" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Regenerar código"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
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
