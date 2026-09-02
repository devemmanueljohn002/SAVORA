import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService, type CreateOrderPayload } from "@/services/orderService";

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id as string),
    enabled: !!id,
  });
}

export function useOrders(status: "active" | "completed" | "cancelled") {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => orderService.list({ status }),
  });
}

export function useOrderTracking(id: string | undefined) {
  return useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => orderService.getTracking(id as string),
    enabled: !!id,
    // Order status can change quickly while a delivery is in progress —
    // poll rather than relying on a single fetch. Swap for a socket/SSE
    // subscription in Phase 9 if the backend adds live push updates.
    refetchInterval: 15000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}

