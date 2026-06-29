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

    getTenantAccessCodes: (
        page: number = 0,
        pageSize: number = 10,
        sortBy: string = "validFrom",
        sortOrder: string = "desc",
    ): Promise<ApiResponse<AccessCodeDetailResponse[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            sortBy,
            sortOrder,
        })

        return apiClient.get<ApiResponse<AccessCodeDetailResponse[]>>(
            `/access-codes/tenant?${params.toString()}`,
        )
    },

    getLandlordAccessCodes: (
        page: number = 0,
        pageSize: number = 10,
        sortBy: string = "validFrom",
        sortOrder: string = "desc",
    ): Promise<ApiResponse<AccessCodeDetailResponse[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            sortBy,
            sortOrder,
        })

        return apiClient.get<ApiResponse<AccessCodeDetailResponse[]>>(
            `/access-codes/landlord?${params.toString()}`,
        )
    },
};
