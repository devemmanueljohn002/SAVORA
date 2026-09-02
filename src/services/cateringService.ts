import { apiClient } from "@/api/client";
import type { CateringBooking, CateringProvider, Paginated } from "@/types";

export interface CateringProviderListParams {
  serviceType?: string;
  location?: string;
  page?: number;
}

export interface CreateCateringBookingPayload {
  providerId: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventLocation: string;
  budget?: number;
  foodPreferences?: string;
  additionalRequirements?: string;
}

export const cateringService = {
  async listProviders(params: CateringProviderListParams = {}): Promise<Paginated<CateringProvider>> {
    const { data } = await apiClient.get("/catering/providers", { params });
    return data;
  },

  async getProviderById(id: string): Promise<CateringProvider> {
    const { data } = await apiClient.get(`/catering/providers/${id}`);
    return data;
  },

  async requestBooking(payload: CreateCateringBookingPayload): Promise<CateringBooking> {
    const { data } = await apiClient.post("/catering/bookings", payload);
    return data;
  },

  /**
   * Not in the spec's endpoint list (section 40 only defines the request-quote
   * flow) — a customer likely wants to see their own booking requests
   * somewhere. Documented assumed contract; confirm against the real backend.
   */
  async myBookings(): Promise<CateringBooking[]> {
    const { data } = await apiClient.get("/catering/bookings/me");
    return data;
  },
};
