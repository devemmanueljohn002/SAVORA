import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
    staleTime: 1000 * 60 * 10, // categories change rarely
  });
}
