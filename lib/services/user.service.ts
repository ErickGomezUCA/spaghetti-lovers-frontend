import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, AppUser, Auth } from "@/types/api-responses";
import { RegisterRequest, UpdateProfileRequest } from "./user.dto";

export const userService = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<Auth>>("/users/login", {
      email,
      password,
    }),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<Auth>>("/users/register", data),

  update: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<AppUser>>("/users/update", data),

  me: () => apiClient.get<ApiResponse<AppUser>>("/users/me"),
};
