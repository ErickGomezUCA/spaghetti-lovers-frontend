import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse } from "@/types/api-responses";
import { ReservationResponse, LandlordReservationSummaryResponse, ReservationDetailResponse } from "@/types/api-responses";

export const reservationService = {
  
  getMyReservations: (page: number = 0, pageSize: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (status) params.append("status", status);

    return apiClient.get<ApiResponse<ReservationResponse[]>>(`/reservations/my-reservations?${params.toString()}`);
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
    // Le quitamos la palabra "landlord" de la URL para usar tu endpoint universal
    return await apiClient.get<{ data: ReservationDetailResponse }>(`/reservations/${id}`);
  },
};

