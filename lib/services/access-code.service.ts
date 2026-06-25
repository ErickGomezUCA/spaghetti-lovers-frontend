import { apiClient } from "@/lib/clients/api-client";
import { AccessCode, ApiResponse } from "@/types/api-responses";

export const accessCodeService = {
    getByReservationId: (
        reservationId: string,
    ): Promise<ApiResponse<AccessCode>> =>
        apiClient.get<ApiResponse<AccessCode>>(
            `/reservations/${reservationId}/access-code`,
        ),
};
