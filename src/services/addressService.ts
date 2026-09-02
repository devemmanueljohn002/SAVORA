import { apiClient } from "@/api/client";
import type { Address } from "@/types";

export type AddressPayload = Omit<Address, "id">;

export const addressService = {
  async list(): Promise<Address[]> {
    const { data } = await apiClient.get("/addresses");
    return data;
  },

  async create(payload: AddressPayload): Promise<Address> {
    const { data } = await apiClient.post("/addresses", payload);
    return data;
  },

  async update(id: string, payload: Partial<AddressPayload>): Promise<Address> {
    const { data } = await apiClient.patch(`/addresses/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },
};
