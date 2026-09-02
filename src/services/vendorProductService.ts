import { apiClient } from "@/api/client";
import type { Product } from "@/types";

/**
 * Vendor-facing menu management (spec section 34: "Manage menu, Update
 * prices, Upload food images, Set availability"). None of these appear in
 * the customer-facing endpoint list (section 40) — documented assumptions
 * for a /vendor/products surface. Confirm exact paths/shapes against the
 * real Express routes before wiring to production.
 */
export type UpsertProductPayload = Omit<Product, "id" | "vendorId" | "rating" | "reviewCount" | "isFavorite">;

export const vendorProductService = {
  async list(): Promise<Product[]> {
    const { data } = await apiClient.get("/vendor/products");
    return data;
  },

  async create(payload: UpsertProductPayload): Promise<Product> {
    const { data } = await apiClient.post("/vendor/products", payload);
    return data;
  },

  async update(id: string, payload: Partial<UpsertProductPayload>): Promise<Product> {
    const { data } = await apiClient.patch(`/vendor/products/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/vendor/products/${id}`);
  },

  async setAvailability(id: string, isAvailable: boolean): Promise<Product> {
    const { data } = await apiClient.patch(`/vendor/products/${id}`, { isAvailable });
    return data;
  },
};
