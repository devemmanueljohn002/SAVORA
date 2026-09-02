import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorProductService, type UpsertProductPayload } from "@/services/vendorProductService";

export function useVendorProducts() {
  return useQuery({
    queryKey: ["vendor-products"],
    queryFn: () => vendorProductService.list(),
  });
}

function useInvalidateVendorProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
}

export function useCreateVendorProduct() {
  const invalidate = useInvalidateVendorProducts();
  return useMutation({
    mutationFn: (payload: UpsertProductPayload) => vendorProductService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateVendorProduct() {
  const invalidate = useInvalidateVendorProducts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpsertProductPayload> }) =>
      vendorProductService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteVendorProduct() {
  const invalidate = useInvalidateVendorProducts();
  return useMutation({
    mutationFn: (id: string) => vendorProductService.remove(id),
    onSuccess: invalidate,
  });
}

export function useSetProductAvailability() {
  const invalidate = useInvalidateVendorProducts();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      vendorProductService.setAvailability(id, isAvailable),
    onSuccess: invalidate,
  });
}
