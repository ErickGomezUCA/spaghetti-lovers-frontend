"use client"

import { useState } from "react"
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react"

// Mock data for reports
const monthlyOccupancy = [
  { month: "Ene", occupancy: 65, revenue: 1200 },
  { month: "Feb", occupancy: 72, revenue: 1450 },
  { month: "Mar", occupancy: 68, revenue: 1320 },
  { month: "Abr", occupancy: 85, revenue: 1890 },
  { month: "May", occupancy: 78, revenue: 1650 },
  { month: "Jun", occupancy: 92, revenue: 2100 },
]

const revenueByProperty = [
  { property: "Apartamento Centro", revenue: 3500, reservations: 12 },
  { property: "Casa Playa", revenue: 5200, reservations: 8 },
  { property: "Loft Moderno", revenue: 2800, reservations: 15 },
  { property: "Cabaña Montaña", revenue: 1900, reservations: 5 },
]

const revenueBreakdown = [
  { name: "Base", value: 8500, color: "#1e40af" },
  { name: "Limpieza", value: 850, color: "#3b82f6" },
  { name: "Penalizaciones", value: 350, color: "#ef4444" },
]

const propertyList = [
  { id: "all", name: "Todas las propiedades" },
  { id: "1", name: "Apartamento Centro Histórico" },
  { id: "2", name: "Casa de Playa Costa del Sol" },
  { id: "3", name: "Loft Moderno Zona Rosa" },
  { id: "4", name: "Cabaña en la Montaña" },
]

export default function ReportsPage() {
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "2024-01-01", end: "2024-06-30" })

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0)
  const avgOccupancy = monthlyOccupancy.reduce((sum, m) => sum + m.occupancy, 0) / monthlyOccupancy.length
  const totalReservations = revenueByProperty.reduce((sum, p) => sum + p.reservations, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Análisis de ocupación e ingresos de tus propiedades</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Propiedad</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Seleccionar propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {propertyList.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
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
            <Button className="bg-primary">
              <Filter className="w-4 h-4 mr-2" />
              Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-semibold mt-1">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+15% vs período anterior</p>
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
                <p className="text-2xl font-semibold mt-1">{avgOccupancy.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 mt-1">+8% vs período anterior</p>
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
                <p className="text-xs text-purple-600 mt-1">En el período</p>
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
                <p className="text-sm text-muted-foreground">Propiedades Activas</p>
                <p className="text-2xl font-semibold mt-1">{revenueByProperty.length}</p>
                <p className="text-xs text-orange-600 mt-1">Generando ingresos</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#c2410c" strokeWidth={2} name="Ocupación %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#c2410c" name="Ingresos $" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Property */}
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
                  <YAxis dataKey="property" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#c2410c" name="Ingresos $" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Desglose de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {revenueBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}: ${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance Table */}
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
                  <th className="text-right py-3 px-4 font-medium">Ingresos</th>
                  <th className="text-right py-3 px-4 font-medium">Ingreso Promedio</th>
                  <th className="text-right py-3 px-4 font-medium">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {revenueByProperty.map((property) => (
                  <tr key={property.property} className="border-b last:border-0">
                    <td className="py-3 px-4">{property.property}</td>
                    <td className="py-3 px-4 text-right">{property.reservations}</td>
                    <td className="py-3 px-4 text-right font-semibold">${property.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      ${(property.revenue / property.reservations).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {((property.revenue / totalRevenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">{totalReservations}</td>
                  <td className="py-3 px-4 text-right">${totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    ${(totalRevenue / totalReservations).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
