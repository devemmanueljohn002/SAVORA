import { apiClient } from "@/api/client";
import type { AppNotification, Paginated } from "@/types";

export const notificationService = {
  async list(params: { page?: number } = {}): Promise<Paginated<AppNotification>> {
    const { data } = await apiClient.get("/notifications", { params });
    return data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },
};
