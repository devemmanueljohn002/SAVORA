import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorCateringService } from "@/services/vendorCateringService";

export function useVendorCateringRequests() {
  return useQuery({
    queryKey: ["vendor-catering-requests"],
    queryFn: () => vendorCateringService.list(),
  });
}

function useInvalidateVendorCateringRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["vendor-catering-requests"] });
}

export function useQuoteCateringRequest() {
  const invalidate = useInvalidateVendorCateringRequests();
  return useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => vendorCateringService.quote(id, price),
    onSuccess: invalidate,
  });
}

export function useDeclineCateringRequest() {
  const invalidate = useInvalidateVendorCateringRequests();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => vendorCateringService.decline(id, reason),
    onSuccess: invalidate,
  });
}
