import { apiClient } from "@/lib/clients/api-client"
import {
    ApiResponse,
    ReservationCancellationPreviewResponse,
    ReservationCancellationResponse,
} from "@/types/api-responses"

export const reservationService = {
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
}