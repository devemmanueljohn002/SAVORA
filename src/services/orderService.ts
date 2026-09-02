import { apiClient } from "@/api/client";
import type { CartLineItem, Order, OrderTrackingUpdate, PaymentMethodType } from "@/types";

export interface CreateOrderPayload {
  vendorId: string;
  items: Pick<CartLineItem, "productId" | "quantity" | "selectedOptions" | "notes">[];
  addressId: string;
  paymentMethod: PaymentMethodType;
  deliveryInstructions?: string;
}

export interface ReorderCheckResult {
  canReorder: boolean;
  unavailableItems: { productId: string; productName: string; reason: string }[];
  vendorIsOpen: boolean;
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post("/orders", payload);
    return data;
  },

  async list(params: { status?: "active" | "completed" | "cancelled" } = {}): Promise<Order[]> {
    const { data } = await apiClient.get("/orders", { params });
    return data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  async cancel(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/orders/${id}/cancel`);
    return data;
  },

  /**
   * Polling-based tracking fetch (spec section 22). No live-tracking
   * endpoint is defined in the backend contract (section 40) yet — this
   * reuses GET /orders/:id and derives a tracking shape from it. Swap for
   * a dedicated GET /orders/:id/tracking or a socket/SSE subscription once
   * the backend exposes rider location and stage pushes.
   */
  async getTracking(id: string): Promise<OrderTrackingUpdate> {
    const order = await orderService.getById(id);
    return {
      orderId: order.id,
      status: order.status,
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Spec section 24: before reordering, check current product availability,
   * price, vendor availability, and operating hours. No dedicated endpoint
   * exists yet — documented contract below; until the backend implements
   * it, callers should fall back to fetching the vendor + products fresh
   * and comparing against the original order's line items client-side.
   */
  async checkReorderEligibility(orderId: string): Promise<ReorderCheckResult> {
    const { data } = await apiClient.get(`/orders/${orderId}/reorder-check`);
    return data;
  },
};
