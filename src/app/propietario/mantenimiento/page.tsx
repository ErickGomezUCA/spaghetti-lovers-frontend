"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Wrench,
  Eye,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { maintenanceService } from "@/lib/services/maintenance.service";
import { propertyService } from "@/lib/services/property.service";
import { uploadService } from "@/lib/services/upload.service";
import { useToast } from "@/hooks/use-toast";
import {
  MaintenanceResponse,
  MaintenanceScheduleResponse,
  Property,
  MaintenanceScheduleFrequency,
} from "@/types/api-responses";
import { useAuth } from "@/lib/contexts/auth-context";

const urgencyColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 border-blue-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

const urgencyLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  RESOLVING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programado",
  RESOLVING: "En progreso",
  RESOLVED: "Resuelto",
};

const scheduleStatusLabels: Record<string, string> = {
  SCHEDULED: "Programado",
  ACTIVE: "Activo",
  DONE: "Completado",
};

const scheduleStatusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  DONE: "bg-gray-100 text-gray-700",
};

const frequencyLabels: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [maintenances, setMaintenances] = useState<MaintenanceResponse[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [schedules, setSchedules] = useState<MaintenanceScheduleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceResponse | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    scheduledStart: "",
    scheduledEnd: "",
    blockCalendar: false,
  });
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: "" });
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    frequency: "MONTHLY" as MaintenanceScheduleFrequency,
    interval: 1,
    nextScheduledDate: "",
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [resolvePhotos, setResolvePhotos] = useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [isUploadingResolve, setIsUploadingResolve] = useState(false);
  const resolveFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    maintenanceService
      .getAll()
      .then((res) => setMaintenances(res.data))
      .catch(() => {});
    if (user?.id) {
      propertyService
        .getByLandlord(user.id, 0, 100)
        .then((res) => setProperties(res.data))
        .catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    if (!selectedPropertyId) return;
    maintenanceService
      .getSchedulesByProperty(selectedPropertyId)
      .then((res) => setSchedules(res.data))
      .catch(() => {});
  }, [selectedPropertyId]);

  const filteredMaintenances = maintenances.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(term) ||
      (m.description?.toLowerCase().includes(term) ?? false);
    const matchesStatus =
      statusFilter === "all" || m.maintenanceStatus === statusFilter;
    const matchesUrgency =
      urgencyFilter === "all" || m.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    scheduled: maintenances.filter((m) => m.maintenanceStatus === "SCHEDULED")
      .length,
    resolving: maintenances.filter((m) => m.maintenanceStatus === "RESOLVING")
      .length,
    resolved: maintenances.filter((m) => m.maintenanceStatus === "RESOLVED")
      .length,
    critical: maintenances.filter(
      (m) => m.urgency === "CRITICAL" && m.maintenanceStatus !== "RESOLVED",
    ).length,
  };

  const handleConfirm = async () => {
    if (
      !selectedMaintenance ||
      !confirmForm.scheduledStart ||
      !confirmForm.scheduledEnd
    )
      return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const res = await maintenanceService.confirm(selectedMaintenance.id, {
        scheduledStart: confirmForm.scheduledStart,
        scheduledEnd: confirmForm.scheduledEnd,
        blockCalendar: confirmForm.blockCalendar,
      });
      setMaintenances((prev) =>
        prev.map((m) => (m.id === selectedMaintenance.id ? res.data : m)),
      );
      setSelectedMaintenance(res.data);
      setShowDetailDialog(false);
      setConfirmForm({
        scheduledStart: "",
        scheduledEnd: "",
        blockCalendar: false,
      });
    } catch (err: unknown) {
      setConfirmError(
        err instanceof Error
          ? err.message
          : "No se pudo confirmar el mantenimiento.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResolveFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploadingResolve(true);
    const results = await Promise.allSettled(
      files.map((f) => uploadService.uploadImage(f)),
    );
    const uploaded = results
      .filter(
        (
          r,
        ): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof uploadService.uploadImage>>
        > => r.status === "fulfilled",
      )
      .map((r) => ({ url: r.value.data.url, publicId: r.value.data.publicId }));
    setResolvePhotos((prev) => [...prev, ...uploaded]);
    setIsUploadingResolve(false);
    e.target.value = "";
  };

  const handleResolve = async () => {
    if (!selectedMaintenance) return;
    setIsResolving(true);
    try {
      const res = await maintenanceService.resolve(selectedMaintenance.id, {
        resolutionNotes: resolveForm.resolutionNotes || undefined,
        photoUrls: resolvePhotos,
      });
      setMaintenances((prev) =>
        prev.map((m) => (m.id === selectedMaintenance.id ? res.data : m)),
      );
      setSelectedMaintenance(res.data);
      setShowDetailDialog(false);
      setResolveForm({ resolutionNotes: "" });
      setResolvePhotos([]);
    } catch (err: unknown) {
      toast({
        title: "Error al resolver",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo resolver el mantenimiento.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (
      !selectedPropertyId ||
      !scheduleForm.title ||
      !scheduleForm.nextScheduledDate
    )
      return;
    setIsCreatingSchedule(true);
    try {
      const res = await maintenanceService.createSchedule({
        propertyId: selectedPropertyId,
        title: scheduleForm.title,
        description: scheduleForm.description || undefined,
        frequency: scheduleForm.frequency,
        interval: scheduleForm.interval,
        nextScheduledDate: scheduleForm.nextScheduledDate + ":00",
      });
      setSchedules((prev) => [...prev, res.data]);
      setShowScheduleDialog(false);
      setScheduleForm({
        title: "",
        description: "",
        frequency: "MONTHLY",
        interval: 1,
        nextScheduledDate: "",
      });
    } catch (err: unknown) {
      toast({
        title: "Error al crear programa",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo crear el programa de mantenimiento.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  const handleTriggerSchedule = async (scheduleId: string) => {
    try {
      await maintenanceService.triggerSchedule(scheduleId);
      maintenanceService
        .getAll()
        .then((res) => setMaintenances(res.data))
        .catch(() => {});
    } catch (err: unknown) {
      toast({
        title: "Error al ejecutar",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo ejecutar el mantenimiento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Mantenimiento
          </h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de reparación y mantenimiento
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {stats.scheduled}
            </p>
            <p className="text-sm text-muted-foreground">Programados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {stats.resolving}
            </p>
            <p className="text-sm text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {stats.resolved}
            </p>
            <p className="text-sm text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">
              {stats.critical}
            </p>
            <p className="text-sm text-muted-foreground">Urgentes</p>
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
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SCHEDULED">Programado</SelectItem>
                <SelectItem value="RESOLVING">En progreso</SelectItem>
                <SelectItem value="RESOLVED">Resuelto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-40 bg-input">
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Table */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problema</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <Wrench className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    No hay solicitudes de mantenimiento
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.title}</p>
                      {m.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {m.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={urgencyColors[m.urgency]}>
                        {m.urgency === "CRITICAL" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {urgencyLabels[m.urgency]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[m.maintenanceStatus]}>
                        <span className="flex items-center gap-1">
                          {m.maintenanceStatus === "SCHEDULED" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {m.maintenanceStatus === "RESOLVING" && (
                            <Wrench className="w-3 h-3" />
                          )}
                          {m.maintenanceStatus === "RESOLVED" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {statusLabels[m.maintenanceStatus]}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {m.maintenanceStatus === "RESOLVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaintenance(m);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Expandir
                          </Button>
                        )}
                        {m.maintenanceStatus === "SCHEDULED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMaintenance(m);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {m.maintenanceStatus === "RESOLVING" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedMaintenance(m);
                              setShowDetailDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preventive Schedules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Mantenimiento Preventivo</h2>
            <p className="text-sm text-muted-foreground">
              Programa mantenimientos periódicos para tus propiedades
            </p>
          </div>
          {selectedPropertyId && (
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Programación
            </Button>
          )}
        </div>

        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Selecciona una propiedad
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger className="mt-1 bg-input">
                  <SelectValue placeholder="Elige una propiedad para ver sus programaciones" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPropertyId && (
              <div className="space-y-3">
                {schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Calendar className="mb-2 h-8 w-8 opacity-50" />
                    <p>No hay programaciones para esta propiedad</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Crear primera programación
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead>Próxima fecha</TableHead>
                        <TableHead>Última ejecución</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <p className="font-medium">{s.title}</p>
                            {s.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {s.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {frequencyLabels[s.frequency]} (c/ {s.interval})
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.nextScheduledDate}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.lastCompletedAt ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={scheduleStatusColors[s.status]}>
                              {scheduleStatusLabels[s.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTriggerSchedule(s.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Ejecutar ahora
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail / Confirm / Resolve Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => { setShowDetailDialog(open); if (!open) setConfirmError(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMaintenance?.maintenanceStatus === "SCHEDULED"
                ? "Programar Mantenimiento"
                : selectedMaintenance?.maintenanceStatus === "RESOLVING"
                  ? "Marcar como Resuelto"
                  : "Detalle de Mantenimiento"}
            </DialogTitle>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Problema</p>
                  <p className="font-medium">{selectedMaintenance.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgencia</p>
                  <Badge className={urgencyColors[selectedMaintenance.urgency]}>
                    {urgencyLabels[selectedMaintenance.urgency]}
                  </Badge>
                </div>
                {selectedMaintenance.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{selectedMaintenance.description}</p>
                  </div>
                )}
              </div>

              {selectedMaintenance.photoUrls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Fotos del problema
                  </p>
                  <div className="flex gap-2">
                    {selectedMaintenance.photoUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedMaintenance.maintenanceStatus === "SCHEDULED" && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">
                        Fecha Inicio
                      </Label>
                      <Input
                        type="datetime-local"
                        className="bg-input"
                        value={confirmForm.scheduledStart}
                        onChange={(e) =>
                          setConfirmForm({
                            ...confirmForm,
                            scheduledStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">
                        Fecha Fin
                      </Label>
                      <Input
                        type="datetime-local"
                        className="bg-input"
                        value={confirmForm.scheduledEnd}
                        onChange={(e) =>
                          setConfirmForm({
                            ...confirmForm,
                            scheduledEnd: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  {confirmError && (
                    <p className="text-sm text-destructive">{confirmError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="blockCalendar"
                      checked={confirmForm.blockCalendar}
                      onCheckedChange={(v) =>
                        setConfirmForm({ ...confirmForm, blockCalendar: !!v })
                      }
                    />
                    <Label htmlFor="blockCalendar" className="text-sm">
                      Bloquear calendario durante el mantenimiento
                    </Label>
                  </div>
                  <Button
                    className="w-full bg-primary"
                    onClick={handleConfirm}
                    disabled={
                      isConfirming ||
                      !confirmForm.scheduledStart ||
                      !confirmForm.scheduledEnd
                    }
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isConfirming ? "Iniciando..." : "Iniciar Mantenimiento"}
                  </Button>
                </div>
              )}

              {selectedMaintenance.maintenanceStatus === "RESOLVING" && (
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Notas de resolución
                    </Label>
                    <Textarea
                      placeholder="Describe el trabajo realizado..."
                      rows={3}
                      className="bg-input"
                      value={resolveForm.resolutionNotes}
                      onChange={(e) =>
                        setResolveForm({ resolutionNotes: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Fotos de resolución
                    </Label>
                    <input
                      ref={resolveFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleResolveFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full"
                      onClick={() => resolveFileInputRef.current?.click()}
                      disabled={isUploadingResolve}
                    >
                      {isUploadingResolve
                        ? "Subiendo..."
                        : `Adjuntar fotos${resolvePhotos.length > 0 ? ` (${resolvePhotos.length})` : ""}`}
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleResolve}
                    disabled={isResolving || isUploadingResolve}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isResolving ? "Guardando..." : "Marcar como Resuelto"}
                  </Button>
                </div>
              )}

              {selectedMaintenance.maintenanceStatus === "RESOLVED" &&
                selectedMaintenance.resolutionNotes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Resolución</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMaintenance.resolutionNotes}
                    </p>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Programación de Mantenimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Título
              </Label>
              <Input
                placeholder="Ej: Revisión de instalaciones eléctricas"
                className="bg-input"
                value={scheduleForm.title}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Descripción
              </Label>
              <Textarea
                placeholder="Detalla qué incluye este mantenimiento..."
                rows={3}
                className="bg-input"
                value={scheduleForm.description}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Frecuencia
                </Label>
                <Select
                  value={scheduleForm.frequency}
                  onValueChange={(v: MaintenanceScheduleFrequency) =>
                    setScheduleForm({ ...scheduleForm, frequency: v })
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Diario</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-medium">
                  Intervalo
                </Label>
                <Input
                  type="number"
                  min={1}
                  className="bg-input"
                  value={scheduleForm.interval}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interval: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium">
                Próxima fecha programada
              </Label>
              <Input
                type="datetime-local"
                className="bg-input"
                value={scheduleForm.nextScheduledDate}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    nextScheduledDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary"
              onClick={handleCreateSchedule}
              disabled={
                isCreatingSchedule ||
                !scheduleForm.title ||
                !scheduleForm.nextScheduledDate
              }
            >
              {isCreatingSchedule ? "Creando..." : "Crear Programación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
