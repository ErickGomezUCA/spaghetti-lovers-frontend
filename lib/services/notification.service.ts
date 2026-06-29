import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, NotificationResponse } from "@/types/api-responses";

export const notificationService = {
    getNotifications: (
        unreadOnly = false,
        page = 0,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    ): Promise<ApiResponse<NotificationResponse[]>> => {
        const params = new URLSearchParams({
            unreadOnly: unreadOnly.toString(),
            page: page.toString(),
            pageSize: pageSize.toString(),
            sortBy,
            sortOrder,
        });

        return apiClient.get<ApiResponse<NotificationResponse[]>>(
            `/notifications?${params.toString()}`,
        );
    },

    getUnreadCount: (): Promise<ApiResponse<number>> =>
        apiClient.get<ApiResponse<number>>("/notifications/unread-count"),

    markAsRead: (
        notificationId: string,
    ): Promise<ApiResponse<NotificationResponse>> =>
        apiClient.patch<ApiResponse<NotificationResponse>>(
            `/notifications/${notificationId}/read`,
        ),

    markAllAsRead: (): Promise<ApiResponse<null>> =>
        apiClient.patch<ApiResponse<null>>("/notifications/read-all"),

    deleteNotification: (notificationId: string): Promise<ApiResponse<null>> =>
        apiClient.delete<ApiResponse<null>>(`/notifications/${notificationId}`),
};