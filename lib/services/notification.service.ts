import { apiClient } from "@/lib/clients/api-client"
import {
    ApiResponse,
    NotificationResponse,
} from "@/types/api-responses"

export const notificationService = {
    getNotifications: (
        unreadOnly: boolean = false,
    ): Promise<ApiResponse<NotificationResponse[]>> =>
        apiClient.get<ApiResponse<NotificationResponse[]>>(
            `/notifications?unreadOnly=${unreadOnly}`,
        ),

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

    deleteNotification: (
        notificationId: string,
    ): Promise<ApiResponse<null>> =>
        apiClient.delete<ApiResponse<null>>(
            `/notifications/${notificationId}`,
        ),
}