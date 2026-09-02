import { useQuery } from "@tanstack/react-query";
import { vendorDashboardService } from "@/services/vendorDashboardService";

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor-dashboard-summary"],
    queryFn: () => vendorDashboardService.getSummary(),
    refetchInterval: 30000, // dashboard numbers should feel live without manual pull-to-refresh
  });
}
