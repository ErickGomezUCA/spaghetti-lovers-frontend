import { apiClient } from "@/lib/clients/api-client"
import {
    ApiResponse,
    ReservationResponse,
    LandlordReservationSummaryResponse,
    ReservationDetailResponse,
    ReservationExtensionResponse,
    ReservationCancellationPreviewResponse,
    ReservationCancellationResponse,
    ReservationCompletionResponse,
} from "@/types/api-responses"

export const reservationService = {

  getMyReservations: async (
    page: number = 0,
    pageSize: number = 10,
    sortBy?: string,
    sortOrder?: string,
    status?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);
    if (status) params.append("status", status);

    return await apiClient.get<ApiResponse<ReservationResponse[]>>(`/reservations/my-reservations?${params.toString()}`);
  },

  getLandlordReservations: (page: number = 0, pageSize: number = 10, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);

    return apiClient.get<ApiResponse<ReservationResponse[]>>(`/reservations/landlord?${params.toString()}`);
  },

  getLandlordSummary: () => {
    return apiClient.get<ApiResponse<LandlordReservationSummaryResponse>>("/reservations/landlord/summary");
  },

    getLandlordReservationDetail: async (id: string) => {
        return await apiClient.get<ApiResponse<ReservationDetailResponse>>(
            `/reservations/${id}`,
        )
    },

    createReservation: async (data: {
        propertyId: string
        checkInDate: string
        checkOutDate: string
        guestsCount: number
        paymentMethod: string
    }) => {
        return await apiClient.post<ApiResponse<ReservationResponse>>(
            "/reservations",
            data,
        )
    },

  extendReservation: async (reservationId: string, data: { newCheckOutDate: string; paymentMethod: string }) => {
    return await apiClient.post<ApiResponse<ReservationExtensionResponse>>(
      `/reservations/${reservationId}/extend`,
      data
    );
  },

    previewCancellation: (
        reservationId: string,
    ): Promise<ApiResponse<ReservationCancellationPreviewResponse>> =>
        apiClient.get<ApiResponse<ReservationCancellationPreviewResponse>>(
            `/reservations/${reservationId}/cancellation-preview`,
        ),

    cancelReservation: (
        reservationId: string,
    ): Promise<ApiResponse<ReservationCancellationResponse>> =>
        apiClient.delete<ApiResponse<ReservationCancellationResponse>>(
            `/reservations/${reservationId}`,
        ),

    completeReservation: (
        reservationId: string,
    ): Promise<ApiResponse<ReservationCompletionResponse>> =>
        apiClient.post<ApiResponse<ReservationCompletionResponse>>(
            `/reservations/${reservationId}/complete`,
            {},
        ),
};