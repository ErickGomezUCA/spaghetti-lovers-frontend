import { apiClient } from "@/lib/clients/api-client";
import {
  ApiResponse,
  MaintenanceResponse,
  MaintenanceScheduleResponse,
  Urgency,
  MaintenanceScheduleFrequency,
} from "@/types/api-responses";

type CreateMaintenanceRequest = {
  reservationId: string;
  title: string;
  description?: string;
  urgency: Urgency;
  photoUrls: { url: string; publicId: string }[];
};

type ConfirmMaintenanceRequest = {
  scheduledStart: string;
  scheduledEnd: string;
  blockCalendar: boolean;
};

type ResolveMaintenanceRequest = {
  resolutionNotes?: string;
  photoUrls: { url: string; publicId: string }[];
};

type CreateMaintenanceScheduleRequest = {
  propertyId: string;
  title: string;
  description?: string;
  frequency: MaintenanceScheduleFrequency;
  interval: number;
  nextScheduledDate: string;
};

export const maintenanceService = {
  getAll: (page = 0, pageSize = 50) =>
    apiClient.get<ApiResponse<MaintenanceResponse[]>>(
      `/maintenances?page=${page}&pageSize=${pageSize}`,
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<MaintenanceResponse>>(`/maintenances/${id}`),

  create: (data: CreateMaintenanceRequest) =>
    apiClient.post<ApiResponse<MaintenanceResponse>>("/maintenances", data),

  confirm: (id: string, data: ConfirmMaintenanceRequest) =>
    apiClient.patch<ApiResponse<MaintenanceResponse>>(
      `/maintenances/${id}/confirm`,
      data,
    ),

  resolve: (id: string, data: ResolveMaintenanceRequest) =>
    apiClient.patch<ApiResponse<MaintenanceResponse>>(
      `/maintenances/${id}/resolve`,
      data,
    ),

  getSchedulesByProperty: (propertyId: string) =>
    apiClient.get<ApiResponse<MaintenanceScheduleResponse[]>>(
      `/maintenance-schedules/property/${propertyId}`,
    ),

  createSchedule: (data: CreateMaintenanceScheduleRequest) =>
    apiClient.post<ApiResponse<MaintenanceScheduleResponse>>(
      "/maintenance-schedules",
      data,
    ),

  triggerSchedule: (id: string) =>
    apiClient.post<ApiResponse<MaintenanceResponse>>(
      `/maintenance-schedules/${id}`,
      {},
    ),
};
