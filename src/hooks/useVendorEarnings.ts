import { useQuery } from "@tanstack/react-query";
import { vendorEarningsService } from "@/services/vendorEarningsService";

export function useVendorEarnings() {
  return useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: () => vendorEarningsService.getSummary(),
  });
}
