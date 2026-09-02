import { apiClient } from "@/api/client";
import type { Order, OrderStatus } from "@/types";

/** Simplified vendor-facing view of order status per spec section 34. */
export type VendorOrderTab = "new" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";

const TAB_TO_STATUSES: Record<VendorOrderTab, OrderStatus[]> = {
  new: ["PLACED", "PAYMENT_CONFIRMED"],
  accepted: ["VENDOR_ACCEPTED"],
  preparing: ["PREPARING"],
  ready: ["READY_FOR_PICKUP", "RIDER_ASSIGNED", "OUT_FOR_DELIVERY"],
  completed: ["DELIVERED"],
  cancelled: ["CANCELLED"],
};

export function statusesForTab(tab: VendorOrderTab): OrderStatus[] {
  return TAB_TO_STATUSES[tab];
}

export const vendorOrderService = {
  async list(tab: VendorOrderTab): Promise<Order[]> {
    const { data } = await apiClient.get("/vendor/orders", { params: { statuses: TAB_TO_STATUSES[tab] } });
    return data;
  },

  async accept(orderId: string, estimatedPrepMinutes: number): Promise<Order> {
    const { data } = await apiClient.post(`/vendor/orders/${orderId}/accept`, { estimatedPrepMinutes });
    return data;
  },

  async reject(orderId: string, reason: string): Promise<Order> {
    const { data } = await apiClient.post(`/vendor/orders/${orderId}/reject`, { reason });
    return data;
  },

  async updatePrepTime(orderId: string, estimatedPrepMinutes: number): Promise<Order> {
    const { data } = await apiClient.patch(`/vendor/orders/${orderId}/prep-time`, { estimatedPrepMinutes });
    return data;
  },

  async markReady(orderId: string): Promise<Order> {
    const { data } = await apiClient.post(`/vendor/orders/${orderId}/ready`);
    return data;
  },
};
