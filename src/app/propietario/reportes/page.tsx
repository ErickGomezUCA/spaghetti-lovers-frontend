"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Building2, Calendar, DollarSign, TrendingUp, Filter, Moon
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { propertyService } from "@/lib/services/property.service"
import { Property, PropertyReportResponse } from "@/types/api-responses"
import { ApiError } from "@/lib/exceptions/api-exceptions"

export default function ReportsPage() {
  const { user } = useAuth()

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // 1 enero año actual
    end: new Date().toISOString().split("T")[0] // hoy
  })
  const [report, setReport] = useState<PropertyReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar propiedades del landlord
  useEffect(() => {
    if (!user) return
    const fetchProperties = async () => {
      try {
        const res = await propertyService.getByLandlord(user.id)
        const props = res.data ?? []
        setProperties(props)
        if (props.length > 0) setSelectedPropertyId(props[0].id)
      } catch (err) {
        console.error("Error fetching properties:", err)
      }
    }
    fetchProperties()
  }, [user])

  const handleApplyFilter = async () => {
    if (!selectedPropertyId || !dateRange.start || !dateRange.end) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await propertyService.getReport(selectedPropertyId, dateRange.start, dateRange.end)
      setReport(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al obtener el reporte")
      setReport(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar reporte automáticamente cuando se selecciona propiedad
  useEffect(() => {
    if (selectedPropertyId) handleApplyFilter()
  }, [selectedPropertyId])

  const revenueBreakdown = report ? [
    { name: "Base", value: Number(report.revenue.base), color: "#1e40af" },
    { name: "Limpieza", value: Number(report.revenue.cleaning), color: "#3b82f6" },
    { name: "Penalizaciones", value: Number(report.revenue.penalties), color: "#ef4444" },
  ] : []

  const totalRevenue = report ? Number(report.revenue.total) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Análisis de ocupación e ingresos de tus propiedades</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Propiedad</Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Seleccionar propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Fecha inicio</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Fecha fin</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-input"
              />
            </div>
            <Button className="bg-primary" onClick={handleApplyFilter} disabled={isLoading}>
              <Filter className="w-4 h-4 mr-2" />
              {isLoading ? "Cargando..." : "Aplicar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Aviso si no hay propiedad */}
      {!selectedPropertyId && (
        <Card className="border border-dashed border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-center py-6 gap-3">
            <Building2 className="w-5 h-5 text-primary/60" />
            <p className="text-muted-foreground text-sm">
              Selecciona una propiedad para ver su reporte.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                    <p className="text-2xl font-semibold mt-1">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.period.start} → {report.period.end}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de Ocupación</p>
                    <p className="text-2xl font-semibold mt-1">{report.occupancyRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Del período</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reservas</p>
                    <p className="text-2xl font-semibold mt-1">{report.totalReservations}</p>
                    <p className="text-xs text-muted-foreground mt-1">En el período</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Noches Ocupadas</p>
                    <p className="text-2xl font-semibold mt-1">{report.totalNightsOccupied}</p>
                    <p className="text-xs text-muted-foreground mt-1">Noches totales</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Moon className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desglose de ingresos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-lg">Desglose de Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBreakdown.filter(r => r.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {revenueBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: ${Number(item.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Período</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Ingresos Base</span>
                  <span className="font-semibold">${Number(report.revenue.base).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Ingresos Limpieza</span>
                  <span className="font-semibold">${Number(report.revenue.cleaning).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Penalizaciones</span>
                  <span className="font-semibold text-red-600">${Number(report.revenue.penalties).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="font-semibold">Total Ingresos</span>
                  <span className="font-bold text-primary text-lg">${totalRevenue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}