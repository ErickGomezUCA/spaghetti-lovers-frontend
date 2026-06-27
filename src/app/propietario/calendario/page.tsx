"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/lib/contexts/auth-context"
import { propertyService } from "@/lib/services/property.service"
import { Property, ConflictResponse, BlockType } from "@/types/api-responses"

const eventTypeColors: Record<BlockType, string> = {
  RESERVATION: "bg-blue-100 text-blue-700 border-blue-200",
  MAINTENANCE: "bg-orange-100 text-orange-700 border-orange-200",
  PREVENTIVE_MAINTENANCE: "bg-purple-100 text-purple-700 border-purple-200",
}

const eventTypeLabels: Record<BlockType, string> = {
  RESERVATION: "Reserva",
  MAINTENANCE: "Mantenimiento",
  PREVENTIVE_MAINTENANCE: "Mantenimiento Preventivo",
}

export default function CalendarPage() {
  const { user } = useAuth()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all")
  const [properties, setProperties] = useState<Property[]>([])
  const [conflicts, setConflicts] = useState<ConflictResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Cargar propiedades del landlord
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

  // Cargar disponibilidad cuando cambia propiedad o mes
  useEffect(() => {
    if (selectedPropertyId === "all" || !selectedPropertyId) {
      setConflicts([])
      return
    }

    const fetchAvailability = async () => {
      setIsLoading(true)
      try {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`
        const lastDay = new Date(year, month + 1, 0).getDate()
        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`

        const res = await propertyService.checkAvailability(selectedPropertyId, startDate, endDate)
        setConflicts(res.data.conflicts ?? [])
      } catch (err) {
        console.error("Error fetching availability:", err)
        setConflicts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedPropertyId, currentDate])

  const goToPreviousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const goToNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const getConflictsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return conflicts.filter((conflict) => {
      const start = conflict.timestampStart.split("T")[0]
      const end = conflict.timestampEnd.split("T")[0]
      return dateStr >= start && dateStr <= end
    })
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const renderCalendarDays = () => {
    const days = []
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
    const today = new Date()

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1
      const isCurrentMonth = day > 0 && day <= daysInMonth
      const dayConflicts = isCurrentMonth ? getConflictsForDay(day) : []
      const isToday = isCurrentMonth &&
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

      days.push(
        <div
          key={i}
          className={`min-h-24 p-2 border border-border ${isCurrentMonth ? "bg-card" : "bg-muted/30"}`}
        >
          {isCurrentMonth && (
            <>
              <span className={`text-sm font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayConflicts.slice(0, 2).map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`text-xs p-1 rounded truncate ${eventTypeColors[conflict.blockType]}`}
                  >
                    {conflict.blockedReason ?? eventTypeLabels[conflict.blockType]}
                  </div>
                ))}
                {dayConflicts.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{dayConflicts.length - 2} más</span>
                )}
              </div>
            </>
          )}
        </div>
      )
    }
    return days
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendario de Disponibilidad</h1>
          <p className="text-muted-foreground">Visualiza reservas y mantenimientos programados</p>
        </div>
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger className="w-56 bg-input">
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

      {/* Leyenda y Eventos ARRIBA del calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <Card className="lg:col-span-2 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Eventos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPropertyId === "all" ? (
              <p className="text-muted-foreground text-sm">Selecciona una propiedad para ver los eventos.</p>
            ) : isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando eventos...</p>
            ) : conflicts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay eventos este mes.</p>
            ) : (
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        conflict.blockType === "RESERVATION" ? "bg-blue-100" :
                        conflict.blockType === "MAINTENANCE" ? "bg-orange-100" : "bg-purple-100"
                      }`}>
                        {conflict.blockType === "RESERVATION" ? (
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                        ) : conflict.blockType === "MAINTENANCE" ? (
                          <Wrench className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Ban className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {conflict.blockedReason ?? eventTypeLabels[conflict.blockType]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conflict.timestampStart).toLocaleDateString("es-ES")} -{" "}
                          {new Date(conflict.timestampEnd).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={eventTypeColors[conflict.blockType]}>
                      {eventTypeLabels[conflict.blockType]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aviso cuando no hay propiedad seleccionada 
      {selectedPropertyId === "all" && (
        <Card className="border border-dashed border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-center py-6 gap-3">
            <CalendarIcon className="w-5 h-5 text-primary/60" />
            <p className="text-muted-foreground text-sm">
              Selecciona una propiedad para ver su disponibilidad en el calendario.
            </p>
          </CardContent>
        </Card>
      )}*/}

      {/* Calendario */}
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
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}