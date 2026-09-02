import { apiClient } from "@/api/client";
import type { Category } from "@/types";

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get("/categories");
    return data;
  },
};
