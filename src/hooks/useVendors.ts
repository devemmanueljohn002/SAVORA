import { useQuery } from "@tanstack/react-query";
import { vendorService, type VendorListParams } from "@/services/vendorService";

export function useVendors(params: VendorListParams = {}) {
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => vendorService.list(params),
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => vendorService.getById(id as string),
    enabled: !!id,
  });
}
