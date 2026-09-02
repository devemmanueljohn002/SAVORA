import { apiClient } from "@/api/client";
import type { Review } from "@/types";

export interface SubmitReviewPayload {
  orderId: string;
  vendorRating: number;
  foodRating: number;
  deliveryRating: number;
  comment?: string;
  photoUrls?: string[];
}

export const reviewService = {
  async list(params: { vendorId?: string; productId?: string } = {}): Promise<Review[]> {
    const { data } = await apiClient.get("/reviews", { params });
    return data;
  },

  async submit(payload: SubmitReviewPayload): Promise<Review> {
    const { data } = await apiClient.post("/reviews", payload);
    return data;
  },
};
