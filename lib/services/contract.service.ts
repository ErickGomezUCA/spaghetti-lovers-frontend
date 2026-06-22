import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, ContractDetailResponse } from "@/types/api-responses";

export const contractService = {
  getMyContracts: () =>
    apiClient.get<ApiResponse<ContractDetailResponse[]>>("/contracts/me"),

  sign: (contractId: string) =>
    apiClient.post<ApiResponse<ContractDetailResponse>>(
      `/contracts/${contractId}/sign`,
      {}
    ),
};
