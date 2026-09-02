import { useQuery } from "@tanstack/react-query";
import { productService, type ProductListParams } from "@/services/productService";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.list(params),
    enabled: !!(params.vendorId || params.categoryId),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id as string),
    enabled: !!id,
  });
}
