import { apiClient } from "@/lib/clients/api-client"
import {
  ApiResponse,
  FineSummaryResponse,
  FineSummaryStatsResponse,
} from "@/types/api-responses"

export const fineService = {
  
  getLandlordFines: (
    page: number = 0,
    pageSize: number = 15,
    fineType?: string,
    resolved?: boolean | string,
    search?: string
  ): Promise<ApiResponse<FineSummaryResponse[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fineType && fineType !== "ALL") params.append("fineType", fineType);
    
    if (resolved === "true" || resolved === true) params.append("resolved", "true");
    if (resolved === "false" || resolved === false) params.append("resolved", "false");
    
    if (search && search.trim() !== "") params.append("search", search.trim());

    return apiClient.get<ApiResponse<FineSummaryResponse[]>>(
      `/fines/landlord/all?${params.toString()}`
    );
  },

  getLandlordSummary: (): Promise<ApiResponse<FineSummaryStatsResponse>> => {
    return apiClient.get<ApiResponse<FineSummaryStatsResponse>>(
      "/fines/landlord/summary"
    );
  },

  createFine: (data: {
    reservationId: string;
    fineType: string;
    amount: number;
    description: string;
  }): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>("/fines", data);
  },

  getMyFines: (
    page: number = 0,
    pageSize: number = 7
  ): Promise<ApiResponse<FineSummaryResponse[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    return apiClient.get<ApiResponse<FineSummaryResponse[]>>(
      `/fines/my-fines?${params.toString()}`
    );
  },

  payFine: (
    fineId: string,
    paymentMethod: string
  ): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>(`/fines/${fineId}/pay`, {
      paymentMethod,
    });
  },
};