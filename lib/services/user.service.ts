import { apiClient } from "@/lib/clients/api-client";
import {
  ApiResponse,
  AppUser,
  Auth,
  UserProfileResponse,
  UserRatingsResponse,
  UserResponse,
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

  getAllUsers: (params?: { page?: number; pageSize?: number; role?: string; search?: string }) => {
    const { page = 0, pageSize = 10, role, search } = params ?? {};
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy: "createdAt", sortOrder: "desc" });
    if (role && role !== "all") query.set("role", role);
    if (search) query.set("search", search);
    return apiClient.get<ApiResponse<UserProfileResponse[]>>(`/users/all?${query}`);
  },

  getUserProfileById: (userId: string) =>
    apiClient.get<ApiResponse<UserProfileResponse>>(`/users/${userId}/profile`),

  getUserById: (userId: string) =>
    apiClient.get<ApiResponse<AppUser>>(`/users/${userId}`),

  getRating: (userId: string) =>
    apiClient.get<ApiResponse<UserRatingsResponse>>(`/users/${userId}/rating`),

  getLandlords: () =>
    apiClient.get<ApiResponse<UserResponse[]>>("/users/landlords"),
};
