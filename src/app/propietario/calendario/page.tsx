"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wrench, Ban } from "lucide-react"

// Mock data for calendar events
const mockEvents = [
  { id: "1", propertyId: "1", propertyName: "Apartamento Centro", type: "reservation", startDate: "2024-06-15", endDate: "2024-06-20", tenant: "María García" },
  { id: "2", propertyId: "2", propertyName: "Casa Playa", type: "reservation", startDate: "2024-06-18", endDate: "2024-06-25", tenant: "Carlos López" },
  { id: "3", propertyId: "1", propertyName: "Apartamento Centro", type: "maintenance", startDate: "2024-06-22", endDate: "2024-06-23", description: "Reparación AC" },
  { id: "4", propertyId: "3", propertyName: "Loft Moderno", type: "preventive_maintenance", startDate: "2024-06-28", endDate: "2024-06-28", description: "Revisión anual" },
]

const properties = [
  { id: "all", name: "Todas las propiedades" },
  { id: "1", name: "Apartamento Centro" },
  { id: "2", name: "Casa Playa" },
  { id: "3", name: "Loft Moderno" },
]

const eventTypeColors = {
  reservation: "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-orange-100 text-orange-700 border-orange-200",
  preventive_maintenance: "bg-purple-100 text-purple-700 border-purple-200",
}

const eventTypeLabels = {
  reservation: "Reserva",
  maintenance: "Mantenimiento",
  preventive_maintenance: "Mantenimiento Preventivo",
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)) // June 2024
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return mockEvents.filter((event) => {
      const matchesProperty = selectedProperty === "all" || event.propertyId === selectedProperty
      const isInRange = dateStr >= event.startDate && dateStr <= event.endDate
      return matchesProperty && isInRange
    })
  }

  const renderCalendarDays = () => {
    const days = []
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1
      const isCurrentMonth = day > 0 && day <= daysInMonth
      const events = isCurrentMonth ? getEventsForDay(day) : []

      days.push(
        <div
          key={i}
          className={`min-h-24 p-2 border border-border ${
            isCurrentMonth ? "bg-card" : "bg-muted/30"
          }`}
        >
          {isCurrentMonth && (
            <>
              <span className={`text-sm font-medium ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? "text-primary" : "text-foreground"}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {events.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${eventTypeColors[event.type as keyof typeof eventTypeColors]}`}
                  >
                    {event.type === "reservation" ? event.tenant : event.description}
                  </div>
                ))}
                {events.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{events.length - 2} más</span>
                )}
              </div>
            </>
          )}
        </div>
      )
    }

    return days
  }

  const filteredEvents = mockEvents.filter(
    (event) => selectedProperty === "all" || event.propertyId === selectedProperty
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendario de Disponibilidad</h1>
          <p className="text-muted-foreground">Visualiza reservas y mantenimientos programados</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-56 bg-input">
              <SelectValue placeholder="Seleccionar propiedad" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Mes
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>

      {/* Legend and upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Legend */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Leyenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm">Reserva</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-sm">Mantenimiento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm">Mantenimiento Preventivo</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-2 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      event.type === "reservation" ? "bg-blue-100" :
                      event.type === "maintenance" ? "bg-orange-100" : "bg-purple-100"
                    }`}>
                      {event.type === "reservation" ? (
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                      ) : event.type === "maintenance" ? (
                        <Wrench className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Ban className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.propertyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.type === "reservation" ? event.tenant : event.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={eventTypeColors[event.type as keyof typeof eventTypeColors]}>
                      {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.startDate} - {event.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
