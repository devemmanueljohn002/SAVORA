import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorStoreService } from "@/services/vendorStoreService";
import type { VendorStoreSettings } from "@/types";

export function useVendorStoreSettings() {
  return useQuery({
    queryKey: ["vendor-store-settings"],
    queryFn: () => vendorStoreService.getSettings(),
  });
}

export function useUpdateVendorStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VendorStoreSettings>) => vendorStoreService.updateSettings(payload),
    onSuccess: (data) => queryClient.setQueryData(["vendor-store-settings"], data),
  });
}
