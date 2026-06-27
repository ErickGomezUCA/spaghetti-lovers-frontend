import { apiClient } from "@/lib/clients/api-client";
import {
  ApiResponse,
  AppUser,
  Auth,
  UserProfileResponse,
  UserRatingsResponse,
} from "@/types/api-responses";
import {
  ChangePasswordRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "./user.dto";

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

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post("/users/change-password", data),

  getProfile: () =>
    apiClient.get<ApiResponse<UserProfileResponse>>("/users/profile"),

  getAllUsers: () =>
    apiClient.get<ApiResponse<UserProfileResponse[]>>("/users/all"),

  getUserProfileById: (userId: string) =>
    apiClient.get<ApiResponse<UserProfileResponse>>(`/users/${userId}/profile`),

  getUserById: (userId: string) =>
    apiClient.get<ApiResponse<AppUser>>(`/users/${userId}`),

  getRating: (userId: string) =>
    apiClient.get<ApiResponse<UserRatingsResponse>>(`/users/${userId}/rating`),
};
