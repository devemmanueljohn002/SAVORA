import { apiClient } from "@/api/client";
import type { Paginated, SearchFilters, Vendor } from "@/types";

export interface VendorListParams extends SearchFilters {
  page?: number;
  pageSize?: number;
  latitude?: number;
  longitude?: number;
}

export const vendorService = {
  async list(params: VendorListParams = {}): Promise<Paginated<Vendor>> {
    const { data } = await apiClient.get("/vendors", { params });
    return data;
  },

  async getById(id: string): Promise<Vendor> {
    const { data } = await apiClient.get(`/vendors/${id}`);
    return data;
  },

  async addFavorite(vendorId: string): Promise<void> {
    await apiClient.post("/favorites", { type: "vendor", id: vendorId });
  },

  async removeFavorite(vendorId: string): Promise<void> {
    await apiClient.delete(`/favorites/${vendorId}`);
  },
};
