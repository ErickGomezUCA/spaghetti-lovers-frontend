import { apiClient } from "@/lib/clients/api-client";
import { ApiResponse, StripePaymentIntentResponse } from "@/types/api-responses";

export const stripeService = {
  createPaymentIntent: (paymentId: string) =>
    apiClient.post<ApiResponse<StripePaymentIntentResponse>>("/stripe/payment-intent", { paymentId }),
};
