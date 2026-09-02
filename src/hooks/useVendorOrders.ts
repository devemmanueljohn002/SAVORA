import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorOrderService, type VendorOrderTab } from "@/services/vendorOrderService";

export function useVendorOrders(tab: VendorOrderTab) {
  return useQuery({
    queryKey: ["vendor-orders", tab],
    queryFn: () => vendorOrderService.list(tab),
    refetchInterval: tab === "new" ? 15000 : undefined, // poll the incoming queue so new orders surface promptly
  });
}

function useInvalidateVendorOrders() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-dashboard-summary"] });
  };
}

export function useAcceptVendorOrder() {
  const invalidate = useInvalidateVendorOrders();
  return useMutation({
    mutationFn: ({ orderId, estimatedPrepMinutes }: { orderId: string; estimatedPrepMinutes: number }) =>
      vendorOrderService.accept(orderId, estimatedPrepMinutes),
    onSuccess: invalidate,
  });
}

export function useRejectVendorOrder() {
  const invalidate = useInvalidateVendorOrders();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => vendorOrderService.reject(orderId, reason),
    onSuccess: invalidate,
  });
}

export function useUpdatePrepTime() {
  const invalidate = useInvalidateVendorOrders();
  return useMutation({
    mutationFn: ({ orderId, estimatedPrepMinutes }: { orderId: string; estimatedPrepMinutes: number }) =>
      vendorOrderService.updatePrepTime(orderId, estimatedPrepMinutes),
    onSuccess: invalidate,
  });
}

export function useMarkOrderReady() {
  const invalidate = useInvalidateVendorOrders();
  return useMutation({
    mutationFn: (orderId: string) => vendorOrderService.markReady(orderId),
    onSuccess: invalidate,
  });
}
