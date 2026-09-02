import { apiClient } from "@/api/client";
import type { VendorDashboardSummary } from "@/types";

/**
 * None of the vendor-side endpoints below appear in the spec's customer-
 * facing contract (section 40) — they're documented assumptions for a
 * vendor API surface under /vendor/*. Confirm exact paths and shapes
 * against the real Express routes before wiring to production.
 */
export const vendorDashboardService = {
  async getSummary(): Promise<VendorDashboardSummary> {
    const { data } = await apiClient.get("/vendor/dashboard/summary");
    return data;
  },
};
