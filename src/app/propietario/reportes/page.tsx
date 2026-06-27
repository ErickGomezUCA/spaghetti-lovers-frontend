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
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts"
import {
  Building2, Calendar, DollarSign, TrendingUp, Filter, Moon
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { propertyService } from "@/lib/services/property.service"
import { Property, PropertyReportResponse } from "@/types/api-responses"
import { ApiError } from "@/lib/exceptions/api-exceptions"

// ✅ Función utilitaria FUERA del componente (no usa hooks, está bien aquí)
function getMonthRanges(start: string, end: string) {
  const months = []
  const current = new Date(start + "T00:00:00")
  const endDate = new Date(end + "T00:00:00")

  while (current <= endDate) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const monthStart = new Date(year, month, 1).toISOString().split("T")[0]
    const monthEnd = new Date(year, month + 1, 0).toISOString().split("T")[0]
    const clampedStart = monthStart < start ? start : monthStart
    const clampedEnd = monthEnd > end ? end : monthEnd

    if (clampedStart < clampedEnd) {
      const label = current.toLocaleString("es-ES", { month: "short" }).replace(".", "")
      months.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        start: clampedStart,
        end: clampedEnd
      })
    }
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

export default function ReportsPage() {
  const { user } = useAuth()

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  })
  const [reports, setReports] = useState<PropertyReportResponse[]>([])
  const [singleReport, setSingleReport] = useState<PropertyReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ✅ useState DENTRO del componente
  const [monthlyData, setMonthlyData] = useState<{ label: string; occupancy: number; revenue: number }[]>([])

  useEffect(() => {
    if (!user) return
    const fetchProperties = async () => {
      try {
        const res = await propertyService.getByLandlord(user.id)
        setProperties(res.data ?? [])
      } catch (err) {
        console.error("Error fetching properties:", err)
      }
    }
    fetchProperties()
  }, [user])

  const handleApplyFilter = async () => {
    if (!dateRange.start || !dateRange.end) return
    setIsLoading(true)
    setError(null)
    try {
      if (selectedPropertyId === "all") {
        const res = await propertyService.getAllPropertiesReport(dateRange.start, dateRange.end)
        setReports(res.data ?? [])
        setSingleReport(null)
      } else {
        const res = await propertyService.getReport(selectedPropertyId, dateRange.start, dateRange.end)
        setSingleReport(res.data)
        setReports([])
      }

      const months = getMonthRanges(dateRange.start, dateRange.end)
      const monthlyResults = await Promise.all(
        months.map(async (m) => {
          try {
            let monthReports: PropertyReportResponse[] = []
            if (selectedPropertyId === "all") {
              const res = await propertyService.getAllPropertiesReport(m.start, m.end)
              monthReports = res.data ?? []
            } else {
              const res = await propertyService.getReport(selectedPropertyId, m.start, m.end)
              monthReports = res.data ? [res.data] : []
            }
            const avgOccupancy = monthReports.length > 0
              ? monthReports.reduce((sum, r) => sum + r.occupancyRate, 0) / monthReports.length
              : 0
            const totalRevenue = monthReports.reduce((sum, r) => sum + Number(r.revenue.total), 0)
            return { label: m.label, occupancy: Math.round(avgOccupancy * 10) / 10, revenue: totalRevenue }
          } catch (err) {
            console.warn(`Error fetching month ${m.label}:`, err)
            return { label: m.label, occupancy: 0, revenue: 0 }
          }
        })
      )
      setMonthlyData(monthlyResults)

    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al obtener el reporte")
      setReports([])
      setSingleReport(null)
      setMonthlyData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (properties.length > 0) handleApplyFilter()
  }, [properties]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeReports = selectedPropertyId === "all" ? reports : (singleReport ? [singleReport] : [])

  const totalRevenue = activeReports.reduce((sum, r) => sum + Number(r.revenue.total), 0)
  const totalReservations = activeReports.reduce((sum, r) => sum + r.totalReservations, 0)
  const totalNights = activeReports.reduce((sum, r) => sum + r.totalNightsOccupied, 0)
  const avgOccupancy = activeReports.length > 0
    ? Math.round(activeReports.reduce((sum, r) => sum + r.occupancyRate, 0) / activeReports.length * 10) / 10
    : 0

  const revenueByProperty = activeReports.map((r) => {
    const property = properties.find(p => p.id === r.propertyId)
    return {
      property: property?.title ?? r.propertyId.slice(0, 8),
      revenue: Number(r.revenue.total),
      reservations: r.totalReservations,
    }
  })

  const revenueBreakdown = [
    { name: "Base", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.base), 0), color: "#1e40af" },
    { name: "Limpieza", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.cleaning), 0), color: "#3b82f6" },
    { name: "Penalizaciones", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.penalties), 0), color: "#ef4444" },
  ].filter(r => r.value > 0)

  const hasData = activeReports.some(r => r.totalReservations > 0)
  const noData = activeReports.length > 0 && activeReports.every(r => r.totalReservations === 0)

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
                  <SelectItem value="all">Todas las propiedades</SelectItem>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-semibold mt-1">${totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Ocupación Promedio</p>
                <p className="text-2xl font-semibold mt-1">{avgOccupancy}%</p>
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
                <p className="text-2xl font-semibold mt-1">{totalReservations}</p>
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
                <p className="text-2xl font-semibold mt-1">{totalNights}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Moon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sin datos */}
      {noData && (
        <Card className="border border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="p-4 bg-muted rounded-full">
              <Building2 className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Sin actividad en el período</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPropertyId === "all"
                  ? "Ninguna de tus propiedades registra reservas"
                  : "Esta propiedad no registra reservas"} entre{" "}
                {new Date(dateRange.start + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} y{" "}
                {new Date(dateRange.end + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.
                Los ingresos y métricas estarán disponibles una vez se realicen reservas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos de tendencia mensual */}
      {hasData && monthlyData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Tendencia de Ocupación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Ocupación"]} />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#c2410c"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#c2410c" }}
                      activeDot={{ r: 6 }}
                      name="Ocupación"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Ingresos"]} />
                    <Bar dataKey="revenue" fill="#c2410c" name="Ingresos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts - solo si hay datos */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Ingresos por Propiedad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByProperty} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="property" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#c2410c" name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Desglose de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
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
              <div className="flex justify-center gap-4 mt-2">
                {revenueBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs">{item.name}: ${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla - solo si hay datos */}
      {hasData && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Rendimiento por Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Propiedad</th>
                    <th className="text-right py-3 px-4 font-medium">Reservas</th>
                    <th className="text-right py-3 px-4 font-medium">Noches</th>
                    <th className="text-right py-3 px-4 font-medium">Ocupación</th>
                    <th className="text-right py-3 px-4 font-medium">Ingresos Base</th>
                    <th className="text-right py-3 px-4 font-medium">Limpieza</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReports.map((report) => {
                    const property = properties.find(p => p.id === report.propertyId)
                    return (
                      <tr key={report.propertyId} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-medium">{property?.title ?? report.propertyId.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{report.totalReservations}</td>
                        <td className="py-3 px-4 text-right">{report.totalNightsOccupied}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            report.occupancyRate >= 75 ? "bg-green-100 text-green-700" :
                            report.occupancyRate >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {report.occupancyRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">${Number(report.revenue.base).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">${Number(report.revenue.cleaning).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">
                          ${Number(report.revenue.total).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-semibold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">{totalReservations}</td>
                    <td className="py-3 px-4 text-right">{totalNights}</td>
                    <td className="py-3 px-4 text-right">{avgOccupancy}%</td>
                    <td className="py-3 px-4 text-right">
                      ${activeReports.reduce((sum, r) => sum + Number(r.revenue.base), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ${activeReports.reduce((sum, r) => sum + Number(r.revenue.cleaning), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ${totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío global */}
      {activeReports.length === 0 && !isLoading && !error && (
        <Card className="border border-dashed border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-center py-8 gap-3">
            <Building2 className="w-5 h-5 text-primary/60" />
            <p className="text-muted-foreground text-sm">
              No hay datos para el período seleccionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}