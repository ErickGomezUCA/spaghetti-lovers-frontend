"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts"
import { Building2, Calendar, DollarSign, TrendingUp, Filter, Moon, Users } from "lucide-react"
import { propertyService } from "@/lib/services/property.service"
import { userService } from "@/lib/services/user.service"
import { PropertyReportResponse, UserResponse } from "@/types/api-responses"
import { ApiError } from "@/lib/exceptions/api-exceptions"

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
        end: clampedEnd,
      })
    }
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

export default function AdminReportsPage() {
  const [landlords, setLandlords] = useState<UserResponse[]>([])
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>("all")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all")
  const [properties, setProperties] = useState<PropertyReportResponse[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [activeReports, setActiveReports] = useState<PropertyReportResponse[]>([])
  const [monthlyData, setMonthlyData] = useState<{ label: string; occupancy: number; revenue: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar landlords al montar
  useEffect(() => {
    userService.getLandlords()
      .then(res => setLandlords(res.data ?? []))
      .catch(err => console.error("Error fetching landlords:", err))
  }, [])

  // Reset propiedad seleccionada al cambiar landlord
  useEffect(() => {
    setSelectedPropertyId("all")
  }, [selectedLandlordId])

  const fetchReports = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return
    setIsLoading(true)
    setError(null)

    try {
      const landlordId = selectedLandlordId === "all" ? undefined : selectedLandlordId

      let reports: PropertyReportResponse[] = []

      if (selectedPropertyId === "all") {
        const res = await propertyService.getAllPropertiesReport(dateRange.start, dateRange.end, landlordId)
        reports = res.data ?? []
      } else {
        const res = await propertyService.getReport(selectedPropertyId, dateRange.start, dateRange.end)
        reports = res.data ? [res.data] : []
      }

      setActiveReports(reports)
      setProperties(reports) // para el selector de propiedades

      // Datos mensuales
      const months = getMonthRanges(dateRange.start, dateRange.end)
      const monthlyResults = await Promise.all(
        months.map(async (m) => {
          try {
            let monthReports: PropertyReportResponse[] = []
            if (selectedPropertyId === "all") {
              const res = await propertyService.getAllPropertiesReport(m.start, m.end, landlordId)
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
          } catch {
            return { label: m.label, occupancy: 0, revenue: 0 }
          }
        })
      )
      setMonthlyData(monthlyResults)

    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al obtener el reporte")
      setActiveReports([])
      setMonthlyData([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedLandlordId, selectedPropertyId, dateRange])

  useEffect(() => {
    fetchReports()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // KPIs
  const totalRevenue = activeReports.reduce((sum, r) => sum + Number(r.revenue.total), 0)
  const totalReservations = activeReports.reduce((sum, r) => sum + r.totalReservations, 0)
  const totalNights = activeReports.reduce((sum, r) => sum + r.totalNightsOccupied, 0)
  const avgOccupancy = activeReports.length > 0
    ? Math.round(activeReports.reduce((sum, r) => sum + r.occupancyRate, 0) / activeReports.length * 10) / 10
    : 0
  const totalProperties = activeReports.length

  const revenueByProperty = activeReports.map((r) => ({
    property: r.propertyTitle,    revenue: Number(r.revenue.total),
  }))

  const revenueBreakdown = [
    { name: "Base", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.base), 0), color: "#1e40af" },
    { name: "Limpieza", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.cleaning), 0), color: "#3b82f6" },
    { name: "Penalizaciones", value: activeReports.reduce((sum, r) => sum + Number(r.revenue.penalties), 0), color: "#ef4444" },
  ].filter(r => r.value > 0)

  const hasData = activeReports.some(r => r.totalReservations > 0)
  const noData = activeReports.length > 0 && !hasData

  const selectedLandlord = landlords.find(l => l.id === selectedLandlordId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-foreground">Reportes — Admin</h1>
        <p className="text-muted-foreground">
          {selectedLandlordId === "all"
            ? "Análisis global de todas las propiedades"
            : `Análisis de propiedades de ${selectedLandlord?.name ?? ""}`}
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">

            {/* Selector de Landlord — exclusivo del Admin */}
            <div className="flex-1 space-y-2 min-w-[200px]">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                <Users className="w-3 h-3 inline mr-1" />
                Landlord
              </Label>
              <Select value={selectedLandlordId} onValueChange={setSelectedLandlordId}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Todos los landlords" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los landlords</SelectItem>
                  {landlords.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} — {l.email}
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
                onChange={(e) => setDateRange(d => ({ ...d, start: e.target.value }))}
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Fecha fin</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(d => ({ ...d, end: e.target.value }))}
                className="bg-input"
              />
            </div>
            <Button className="bg-primary" onClick={fetchReports} disabled={isLoading}>
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

      {/* KPIs — 5 cards para Admin (agrega "Total Propiedades") */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        <Card className="border-t-4 border-t-teal-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Propiedades</p>
                <p className="text-2xl font-semibold mt-1">{totalProperties}</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-lg">
                <Building2 className="w-5 h-5 text-teal-600" />
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
                No hay reservas registradas para el período y filtros seleccionados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos mensuales */}
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
                    <Line type="monotone" dataKey="occupancy" stroke="#c2410c" strokeWidth={2}
                      dot={{ r: 4, fill: "#c2410c" }} activeDot={{ r: 6 }} />
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
                    <YAxis tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Ingresos"]} />
                    <Bar dataKey="revenue" fill="#c2410c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ingresos por propiedad + Desglose */}
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
                    <XAxis type="number" tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="property" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Ingresos"]} />
                    <Bar dataKey="revenue" fill="#c2410c" radius={[0, 4, 4, 0]} />
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
                    <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                      paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {revenueBreakdown.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {revenueBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs">{item.name}: ${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla */}
      {hasData && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Rendimiento por Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
                  {activeReports.map((report) => (
                    <tr key={report.propertyId} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">{report.propertyTitle}</span>
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
                  ))}
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
            <p className="text-muted-foreground text-sm">No hay datos para el período seleccionado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}