import { apiClient } from "@/api/client";
import type { Paginated, Product } from "@/types";

export interface ProductListParams {
  vendorId?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async list(params: ProductListParams = {}): Promise<Paginated<Product>> {
    const { data } = await apiClient.get("/products", { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  async addFavorite(productId: string): Promise<void> {
    await apiClient.post("/favorites", { type: "product", id: productId });
  },

  async removeFavorite(productId: string): Promise<void> {
    await apiClient.delete(`/favorites/${productId}`);
  },
};
