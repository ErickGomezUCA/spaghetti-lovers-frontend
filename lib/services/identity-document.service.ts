import { apiClient } from "@/lib/clients/api-client"
import { ApiResponse, DocumentStatus, IdentityDocumentResponse } from "@/types/api-responses"

export const identityDocumentService = {
  getAllDocuments: (status?: string): Promise<ApiResponse<IdentityDocumentResponse[]>> => {
    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.append("status", status);
    }
    return apiClient.get<ApiResponse<IdentityDocumentResponse[]>>(`/identity-documents?${params.toString()}`);
  },

  submitDocument: (documentUrl: string): Promise<ApiResponse<IdentityDocumentResponse>> => {
    return apiClient.post<ApiResponse<IdentityDocumentResponse>>(`/identity-documents`, {
      documentUrl,
    });
  },

  reviewDocument: (
    documentId: string,
    documentStatus: DocumentStatus,
    rejectionReason?: string
  ): Promise<ApiResponse<IdentityDocumentResponse>> => {
    return apiClient.patch<ApiResponse<IdentityDocumentResponse>>(`/identity-documents/${documentId}`, {
      documentStatus,
      rejectionReason: rejectionReason || null, // Se envía null si es aprobado
    });
  },

  getMyDocument: (): Promise<ApiResponse<IdentityDocumentResponse | null>> => {
    return apiClient.get<ApiResponse<IdentityDocumentResponse | null>>(`/identity-documents/me`);
  },
};