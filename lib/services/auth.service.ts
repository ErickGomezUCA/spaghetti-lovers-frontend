import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, Auth } from "@/types/api-responses";

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<Auth>>("/users/login", {
      email,
      password,
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) => apiClient.post<ApiResponse<Auth>>("/users/register", data),
};
