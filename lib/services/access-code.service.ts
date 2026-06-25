import { apiClient } from "@/lib/clients/api-client";
import {
    AccessCode,
    AccessCodeDetailResponse,
    ApiResponse,
} from "@/types/api-responses";

export const accessCodeService = {
    getByReservationId: (
        reservationId: string,
    ): Promise<ApiResponse<AccessCode>> =>
        apiClient.get<ApiResponse<AccessCode>>(
            `/reservations/${reservationId}/access-code`,
        ),

    getTenantAccessCodes: (): Promise<ApiResponse<AccessCodeDetailResponse[]>> =>
        apiClient.get<ApiResponse<AccessCodeDetailResponse[]>>(
            "/access-codes/tenant",
        ),

    getLandlordAccessCodes: (): Promise<ApiResponse<AccessCodeDetailResponse[]>> =>
        apiClient.get<ApiResponse<AccessCodeDetailResponse[]>>(
            "/access-codes/landlord",
        ),
};
