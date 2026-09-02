import { apiClient } from "@/api/client";
import type { Product, SearchFilters, SearchResult, Vendor } from "@/types";

export interface SearchParams extends SearchFilters {
  query: string;
}

export const searchService = {
  /**
   * Backend contract not yet fixed in spec section 40 for a combined search
   * endpoint — this composes /vendors and /products with a `q` param.
   * Swap for a single GET /search?q=... call once that route exists.
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, ...filters } = params;
    const [vendorsRes, productsRes] = await Promise.all([
      apiClient.get<{ data: Vendor[] }>("/vendors", { params: { q: query, ...filters } }),
      apiClient.get<{ data: Product[] }>("/products", { params: { q: query } }),
    ]);
    return {
      vendors: vendorsRes.data.data ?? [],
      products: productsRes.data.data ?? [],
    };
  },
};
