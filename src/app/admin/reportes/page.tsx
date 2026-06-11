"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  BarChart3,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Percent,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PropertyReport {
  id: string
  propertyTitle: string
  landlord: string
  totalReservations: number
  totalNightsOccupied: number
  totalRevenue: number
  occupancyRate: number
  averageNightlyRate: number
  maintenanceCosts: number
}

const mockReports: PropertyReport[] = [
  {
    id: "1",
    propertyTitle: "Apartamento Vista al Mar",
    landlord: "Carlos Mendez",
    totalReservations: 12,
    totalNightsOccupied: 85,
    totalRevenue: 7225,
    occupancyRate: 78,
    averageNightlyRate: 85,
    maintenanceCosts: 450,
  },
  {
    id: "2",
    propertyTitle: "Casa de Playa Familiar",
    landlord: "Maria Rodriguez",
    totalReservations: 8,
    totalNightsOccupied: 62,
    totalRevenue: 9300,
    occupancyRate: 68,
    averageNightlyRate: 150,
    maintenanceCosts: 800,
  },
  {
    id: "3",
    propertyTitle: "Loft Centro Historico",
    landlord: "Roberto Flores",
    totalReservations: 15,
    totalNightsOccupied: 92,
    totalRevenue: 5980,
    occupancyRate: 85,
    averageNightlyRate: 65,
    maintenanceCosts: 200,
  },
  {
    id: "4",
    propertyTitle: "Villa con Piscina",
    landlord: "Ana Martinez",
    totalReservations: 6,
    totalNightsOccupied: 45,
    totalRevenue: 9000,
    occupancyRate: 55,
    averageNightlyRate: 200,
    maintenanceCosts: 1200,
  },
]

export default function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("month")

  const filteredReports = mockReports.filter((report) =>
    report.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.landlord.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const globalStats = {
    totalRevenue: mockReports.reduce((sum, r) => sum + r.totalRevenue, 0),
    totalReservations: mockReports.reduce((sum, r) => sum + r.totalReservations, 0),
    avgOccupancy: Math.round(mockReports.reduce((sum, r) => sum + r.occupancyRate, 0) / mockReports.length),
    totalMaintenance: mockReports.reduce((sum, r) => sum + r.maintenanceCosts, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes Globales</h1>
          <p className="text-muted-foreground mt-1">Analisis de ocupacion e ingresos de todas las propiedades</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-foreground">${globalStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold text-blue-600">{globalStats.totalReservations}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupacion Promedio</p>
                <p className="text-2xl font-bold text-green-600">{globalStats.avgOccupancy}%</p>
              </div>
              <Percent className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Costos Mantenimiento</p>
                <p className="text-2xl font-bold text-orange-600">${globalStats.totalMaintenance.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por propiedad o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {dateRange === "week" ? "Ultima semana" : dateRange === "month" ? "Ultimo mes" : dateRange === "quarter" ? "Ultimo trimestre" : "Ultimo ano"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDateRange("week")}>
                  Ultima semana
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("month")}>
                  Ultimo mes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("quarter")}>
                  Ultimo trimestre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("year")}>
                  Ultimo ano
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Reports by Property */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reporte por Propiedad ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Propiedad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Propietario</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Reservas</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Noches</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ocupacion</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ingresos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Mantenimiento</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{report.propertyTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{report.landlord}</td>
                    <td className="py-3 px-4 text-center text-foreground">{report.totalReservations}</td>
                    <td className="py-3 px-4 text-center text-foreground">{report.totalNightsOccupied}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.occupancyRate >= 75 ? "bg-green-100 text-green-700" :
                        report.occupancyRate >= 50 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {report.occupancyRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ${report.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600">
                      -${report.maintenanceCosts.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      ${(report.totalRevenue - report.maintenanceCosts).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td colSpan={2} className="py-3 px-4 font-bold text-foreground">TOTALES</td>
                  <td className="py-3 px-4 text-center font-bold text-foreground">{globalStats.totalReservations}</td>
                  <td className="py-3 px-4 text-center font-bold text-foreground">
                    {mockReports.reduce((sum, r) => sum + r.totalNightsOccupied, 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-foreground">{globalStats.avgOccupancy}%</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    ${globalStats.totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-orange-600">
                    -${globalStats.totalMaintenance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-foreground">
                    ${(globalStats.totalRevenue - globalStats.totalMaintenance).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron reportes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
