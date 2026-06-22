import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, Property } from "@/types/api-responses";
import {
  AttachPhotoRequest,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from "./property.dto";

export const propertyService = {
  getAll: (page = 0, pageSize = 10) =>
    apiClient.get<ApiResponse<Property[]>>(
      `/properties?page=${page}&pageSize=${pageSize}`,
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Property>>(`/properties/${id}`),

  getByLandlord: (landlordId: string, page = 0, pageSize = 100) =>
    apiClient.get<ApiResponse<Property[]>>(
      `/properties/landlord/${landlordId}?page=${page}&pageSize=${pageSize}`,
    ),

  create: (data: CreatePropertyRequest) =>
    apiClient.post<ApiResponse<Property>>("/properties", data),

  update: (id: string, data: UpdatePropertyRequest) =>
    apiClient.put<ApiResponse<Property>>(`/properties/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/properties/${id}`),

  attachPhotos: (id: string, data: AttachPhotoRequest) =>
    apiClient.post<ApiResponse<Property>>(
      `/properties/attach-photos/${id}`,
      data,
    ),
};
