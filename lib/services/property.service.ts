import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, Property, AvailabilityResponse } from "@/types/api-responses";
import {
  AttachPhotoRequest,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from "./property.dto";

type SearchParams = {
  term?: string;
  propertyType?: string;
  minGuests?: number;
  status?: string;
};

export const propertyService = {
  getAll: (page = 0, pageSize = 10, search?: SearchParams) => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search?.term) q.set("term", search.term);
    if (search?.propertyType) q.set("propertyType", search.propertyType);
    if (search?.minGuests) q.set("minGuests", String(search.minGuests));
    if (search?.status) q.set("status", search.status);
    return apiClient.get<ApiResponse<Property[]>>(`/properties?${q}`);
  },

  checkAvailability: (id: string, startDate: string, endDate: string) =>
  apiClient.get<ApiResponse<AvailabilityResponse>>(
    `/properties/${id}/availability?startDate=${startDate}&endDate=${endDate}`
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
