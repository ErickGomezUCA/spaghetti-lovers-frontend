import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, RatingResponse, UserRatingsResponse } from "@/types/api-responses";
import { CreateRatingRequest } from "./rating.dto";

export const ratingService = {
  create: (data: CreateRatingRequest) =>
    apiClient.post<ApiResponse<RatingResponse>>("/users/ratings", data),

  getByUser: (userId: string) =>
    apiClient.get<ApiResponse<UserRatingsResponse>>(`/users/${userId}/rating`),

  getGivenByUser: (userId: string) =>
    apiClient.get<ApiResponse<RatingResponse[]>>(`/users/${userId}/ratings-given`),
};