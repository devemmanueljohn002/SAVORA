import { apiClient } from "@/api/client";
import type { CartLineItem } from "@/types";

/**
 * Server-persisted cart per spec section 40's /cart endpoints.
 *
 * NOT currently wired into cartStore — Phase 4 uses Zustand as the sole
 * source of truth for a snappier, offline-friendly add-to-cart experience.
 * Wire these in (e.g. debounce a PATCH on every cartStore change, and call
 * `fetch()` on app foreground to reconcile) if cross-device cart sync is
 * a requirement; skip it if the cart is expected to be device-local until checkout.
 */
export const cartService = {
  async fetch(): Promise<{ vendorId: string | null; items: CartLineItem[] }> {
    const { data } = await apiClient.get("/cart");
    return data;
  },

  async replace(items: CartLineItem[]): Promise<void> {
    await apiClient.post("/cart", { items });
  },

  async patch(items: Partial<CartLineItem> & { id: string }): Promise<void> {
    await apiClient.patch("/cart", items);
  },

  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  },
};
