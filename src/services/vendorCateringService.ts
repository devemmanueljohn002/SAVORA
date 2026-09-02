import { apiClient } from "@/api/client";
import type { VendorCateringRequest } from "@/types";

/**
 * Spec section 34 ("Catering requests" in the vendor dashboard) + section 29
 * ("The provider can later respond through the backend/vendor dashboard").
 * Not in the customer-facing endpoint list (section 40) — documented
 * assumption for a /vendor/catering-requests surface.
 */
export const vendorCateringService = {
  async list(): Promise<VendorCateringRequest[]> {
    const { data } = await apiClient.get("/vendor/catering-requests");
    return data;
  },

  async quote(id: string, price: number): Promise<VendorCateringRequest> {
    const { data } = await apiClient.post(`/vendor/catering-requests/${id}/quote`, { price });
    return data;
  },

  async decline(id: string, reason?: string): Promise<VendorCateringRequest> {
    const { data } = await apiClient.post(`/vendor/catering-requests/${id}/decline`, { reason });
    return data;
  },
};
