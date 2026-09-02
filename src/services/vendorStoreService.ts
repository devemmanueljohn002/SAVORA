import { apiClient } from "@/api/client";
import type { VendorStoreSettings } from "@/types";

/** Spec section 34: "Set availability, Set operating hours". */
export const vendorStoreService = {
  async getSettings(): Promise<VendorStoreSettings> {
    const { data } = await apiClient.get("/vendor/store/settings");
    return data;
  },

  async updateSettings(payload: Partial<VendorStoreSettings>): Promise<VendorStoreSettings> {
    const { data } = await apiClient.patch("/vendor/store/settings", payload);
    return data;
  },
};
