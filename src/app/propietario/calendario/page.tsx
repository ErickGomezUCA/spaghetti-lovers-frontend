"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Wrench,
  Clock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { propertyService } from "@/lib/services/property.service";
import { Property } from "@/types/api-responses";

type EntryType = "RESERVATION" | "MAINTENANCE" | "MAINTENANCE_SCHEDULE";

type CalendarEntry = {
  id: string;
  type: EntryType;
  propertyId: string;
  propertyTitle: string;
  title: string;
  timestampStart: string;
  timestampEnd: string;
  status?: string;
};

const entryTypeColors: Record<EntryType, string> = {
  RESERVATION: "bg-blue-100 text-blue-700 border-blue-200",
  MAINTENANCE: "bg-orange-100 text-orange-700 border-orange-200",
  MAINTENANCE_SCHEDULE: "bg-purple-100 text-purple-700 border-purple-200",
};

const entryTypeLabels: Record<EntryType, string> = {
  RESERVATION: "Reserva",
  MAINTENANCE: "Mantenimiento",
  MAINTENANCE_SCHEDULE: "Mantenimiento Preventivo",
};

export default function CalendarPage() {
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
  }, [searchParams]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    if (!user) return;
    propertyService
      .getByLandlord(user.id)
      .then((res) => setProperties(res.data ?? []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchCalendar = async () => {
      setIsLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

        const res = await propertyService.getLandlordCalendar(
          startDate,
          endDate,
        );
        const data = res.data;

        const merged: CalendarEntry[] = [
          ...(data.reservations ?? []).map((r) => ({
            id: r.id,
            type: "RESERVATION" as EntryType,
            propertyId: r.propertyId,
            propertyTitle: r.propertyTitle,
            title: r.title ?? "Reserva",
            timestampStart: r.timestampStart,
            timestampEnd: r.timestampEnd,
          })),
          ...(data.maintenances ?? []).map((m) => ({
            id: m.id,
            type: "MAINTENANCE" as EntryType,
            propertyId: m.propertyId,
            propertyTitle: m.propertyTitle,
            title: m.title,
            timestampStart: m.scheduledStart,
            timestampEnd: m.scheduledEnd,
            status: m.maintenanceStatus,
          })),
          ...(data.maintenanceSchedules ?? []).map((s) => ({
            id: s.id,
            type: "MAINTENANCE_SCHEDULE" as EntryType,
            propertyId: s.propertyId,
            propertyTitle: s.propertyTitle,
            title: s.title,
            timestampStart: s.scheduledStart,
            timestampEnd: s.scheduledEnd,
            status: s.status,
          })),
        ];

        setEntries(merged);
      } catch {
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, [user, currentDate]);

  const goToPreviousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

  const goToNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const visibleEntries =
    selectedPropertyId === "all"
      ? entries
      : entries.filter((e) => e.propertyId === selectedPropertyId);

  const getEntriesForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return visibleEntries.filter((entry) => {
      const start = entry.timestampStart.split("T")[0];
      const end = entry.timestampEnd.split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const today = new Date();

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dayEntries = isCurrentMonth ? getEntriesForDay(day) : [];
      const isToday =
        isCurrentMonth &&
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      const visibleCount = dayEntries.length >= 3 ? 1 : 2;

      days.push(
        <div
          key={i}
          onClick={() => {
            if (isCurrentMonth && dayEntries.length > 0) setSelectedDay(day);
          }}
          className={`min-h-24 p-2 border border-border transition-colors ${
            isCurrentMonth
              ? dayEntries.length > 0
                ? "bg-card hover:bg-muted/40 cursor-pointer"
                : "bg-card"
              : "bg-muted/30"
          }`}
        >
          {isCurrentMonth && (
            <>
              <span
                className={`text-sm font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}
              >
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayEntries.slice(0, visibleCount).map((entry) => (
                  <div
                    key={entry.id}
                    className={`text-xs p-1 rounded truncate ${entryTypeColors[entry.type]}`}
                  >
                    {entry.title}
                  </div>
                ))}
                {dayEntries.length >= 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{dayEntries.length - 1} más
                  </span>
                )}
              </div>
            </>
          )}
        </div>,
      );
    }
    return days;
  };

  const dialogEntries =
    selectedDay !== null ? getEntriesForDay(selectedDay) : visibleEntries;

  const dialogTitle =
    selectedDay !== null
      ? `Eventos del ${selectedDay} de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : `Todos los eventos: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Calendario de Disponibilidad
          </h1>
          <p className="text-muted-foreground">
            Visualiza reservas y mantenimientos programados
          </p>
        </div>
        <Select
          value={selectedPropertyId}
          onValueChange={setSelectedPropertyId}
        >
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
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderCalendarDays()}</div>
        </CardContent>
      </Card>

      {/* Leyenda y Eventos */}
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
            {isLoading ? (
              <p className="text-muted-foreground text-sm">
                Cargando eventos...
              </p>
            ) : visibleEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay eventos este mes.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleEntries.slice(0, 2).map((entry) => (
                  <EntryItem
                    key={entry.id}
                    entry={entry}
                    showProperty={selectedPropertyId === "all"}
                  />
                ))}
                {visibleEntries.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1"
                    onClick={() => setShowAllEvents(true)}
                  >
                    Ver más ({visibleEntries.length - 2} más)
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog
        open={showAllEvents || selectedDay !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAllEvents(false);
            setSelectedDay(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3">
              {dialogEntries.map((entry) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  showProperty={selectedPropertyId === "all"}
                />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryItem({
  entry,
  showProperty,
}: {
  entry: CalendarEntry;
  showProperty: boolean;
}) {
  const entryTypeColors: Record<EntryType, string> = {
    RESERVATION: "bg-blue-100 text-blue-700 border-blue-200",
    MAINTENANCE: "bg-orange-100 text-orange-700 border-orange-200",
    MAINTENANCE_SCHEDULE: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const entryTypeLabels: Record<EntryType, string> = {
    RESERVATION: "Reserva",
    MAINTENANCE: "Mantenimiento",
    MAINTENANCE_SCHEDULE: "Mantenimiento Preventivo",
  };

  const Icon =
    entry.type === "RESERVATION"
      ? CalendarIcon
      : entry.type === "MAINTENANCE"
        ? Wrench
        : Clock;

  const iconColor =
    entry.type === "RESERVATION"
      ? "text-blue-600"
      : entry.type === "MAINTENANCE"
        ? "text-orange-600"
        : "text-purple-600";

  const iconBg =
    entry.type === "RESERVATION"
      ? "bg-blue-100"
      : entry.type === "MAINTENANCE"
        ? "bg-orange-100"
        : "bg-purple-100";

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{entry.title}</p>
          {showProperty && (
            <p className="text-xs text-primary font-medium">
              {entry.propertyTitle}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(entry.timestampStart).toLocaleDateString("es-ES")} —{" "}
            {new Date(entry.timestampEnd).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>
      <Badge variant="outline" className={entryTypeColors[entry.type]}>
        {entryTypeLabels[entry.type]}
      </Badge>
    </div>
  );
}
