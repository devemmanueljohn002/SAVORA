import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService, type SubmitReviewPayload } from "@/services/reviewService";

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => reviewService.submit(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
