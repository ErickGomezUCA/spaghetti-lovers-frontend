import { apiClient } from "@/lib/clients/api-client";
import { AdminMonthlySummary, ApiResponse } from "@/types/api-responses";

export const adminService = {
  getMonthlySummary: (activePropertiesCount: number) =>
    apiClient.get<ApiResponse<AdminMonthlySummary>>(
      `/users/admin/monthly-summary?activePropertiesCount=${activePropertiesCount}`,
    ),
};
