import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cateringService,
  type CateringProviderListParams,
  type CreateCateringBookingPayload,
} from "@/services/cateringService";

export function useCateringProviders(params: CateringProviderListParams = {}) {
  return useQuery({
    queryKey: ["catering-providers", params],
    queryFn: () => cateringService.listProviders(params),
  });
}

export function useCateringProvider(id: string | undefined) {
  return useQuery({
    queryKey: ["catering-provider", id],
    queryFn: () => cateringService.getProviderById(id as string),
    enabled: !!id,
  });
}

export function useCreateCateringBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCateringBookingPayload) => cateringService.requestBooking(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-bookings"] }),
  });
}

export function useMyCateringBookings() {
  return useQuery({
    queryKey: ["catering-bookings"],
    queryFn: () => cateringService.myBookings(),
  });
}
