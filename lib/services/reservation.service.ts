import { apiClient } from "@/lib/clients/api-client"
import {
  ApiResponse,
  ReservationResponse,
  LandlordReservationSummaryResponse,
  ReservationDetailResponse,
  ReservationExtensionResponse,
  ReservationCancellationPreviewResponse,
  ReservationCancellationResponse,
} from "@/types/api-responses"

export const reservationService = {

  getMyReservations: (
    page: number = 0,
    pageSize: number = 10,
    sortBy?: string,
    sortOrder?: string,
    status?: string
  ): Promise<ApiResponse<ReservationResponse[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);
    if (status) params.append("status", status);

    return apiClient.get<ApiResponse<ReservationResponse[]>>(`/reservations/my-reservations?${params.toString()}`);
  },

  getLandlordReservations: (
    page: number = 0, 
    pageSize: number = 10, 
    status?: string, 
    search?: string
  ): Promise<ApiResponse<ReservationResponse[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);

    return apiClient.get<ApiResponse<ReservationResponse[]>>(`/reservations/landlord?${params.toString()}`);
  },

  getLandlordSummary: (): Promise<ApiResponse<LandlordReservationSummaryResponse>> => {
    return apiClient.get<ApiResponse<LandlordReservationSummaryResponse>>("/reservations/landlord/summary");
  },

  getLandlordReservationDetail: (id: string): Promise<ApiResponse<ReservationDetailResponse>> => {
    return apiClient.get<ApiResponse<ReservationDetailResponse>>(`/reservations/${id}`);
  },

  createReservation: (data: {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    paymentMethod: string;
  }): Promise<ApiResponse<ReservationResponse>> => {
    return apiClient.post<ApiResponse<ReservationResponse>>("/reservations", data);
  },

  extendReservation: (
    reservationId: string, 
    data: { newCheckOutDate: string; paymentMethod: string }
  ): Promise<ApiResponse<ReservationExtensionResponse>> => {
    return apiClient.post<ApiResponse<ReservationExtensionResponse>>(
      `/reservations/${reservationId}/extend`,
      data
    );
  },

  previewCancellation: (
    reservationId: string,
  ): Promise<ApiResponse<ReservationCancellationPreviewResponse>> => {
    return apiClient.get<ApiResponse<ReservationCancellationPreviewResponse>>(
      `/reservations/${reservationId}/cancellation-preview`
    );
  },

  cancelReservation: (
    reservationId: string,
  ): Promise<ApiResponse<ReservationCancellationResponse>> => {
    return apiClient.delete<ApiResponse<ReservationCancellationResponse>>(
      `/reservations/${reservationId}`
    );
  },

getAllReservations: (
    page: number = 0, 
    pageSize: number = 15,
    search?: string,
    status?: string
  ): Promise<ApiResponse<ReservationResponse[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search && search.trim() !== "") params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    return apiClient.get<ApiResponse<ReservationResponse[]>>(
      `/reservations/admin/all?${params.toString()}`
    );
  },
};