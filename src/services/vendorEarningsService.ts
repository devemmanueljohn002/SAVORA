import { apiClient } from "@/api/client";
import type { VendorEarningsSummary } from "@/types";

export const vendorEarningsService = {
  async getSummary(): Promise<VendorEarningsSummary> {
    const { data } = await apiClient.get("/vendor/earnings");
    return data;
  },
};
