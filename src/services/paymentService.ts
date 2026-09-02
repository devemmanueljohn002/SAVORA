import { apiClient } from "@/api/client";
import type { PaymentMethodType } from "@/types";

export interface InitializePaymentPayload {
  orderId: string;
  method: PaymentMethodType;
}

export interface InitializePaymentResponse {
  reference: string;
  /** Hosted checkout URL for Paystack/Flutterwave — open in a WebView or in-app browser. */
  authorizationUrl?: string;
}

export interface VerifyPaymentResponse {
  reference: string;
  status: "PENDING" | "PAID" | "FAILED";
  orderId: string;
}

export const paymentService = {
  async initialize(payload: InitializePaymentPayload): Promise<InitializePaymentResponse> {
    const { data } = await apiClient.post("/payments/initialize", payload);
    return data;
  },

  /**
   * Confirms payment status. This is the ONLY source of truth for whether an
   * order is paid — never mark an order/UI as "paid" based on the checkout
   * webview closing or redirecting; always call this and check the result.
   */
  async verify(reference: string): Promise<VerifyPaymentResponse> {
    const { data } = await apiClient.get(`/payments/verify/${reference}`);
    return data;
  },
};
