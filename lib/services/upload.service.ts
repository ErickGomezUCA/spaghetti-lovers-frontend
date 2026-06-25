import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, FileUploadResponse } from "@/types/api-responses";

export const uploadService = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postForm<ApiResponse<FileUploadResponse>>(
      "/upload/image",
      formData,
    );
  },
};
