import { useQuery } from "@tanstack/react-query";
import { searchService, type SearchParams } from "@/services/searchService";

export function useSearch(params: SearchParams) {
  const trimmedQuery = params.query.trim();

  return useQuery({
    queryKey: ["search", { ...params, query: trimmedQuery }],
    queryFn: () => searchService.search({ ...params, query: trimmedQuery }),
    enabled: trimmedQuery.length >= 2,
  });
}
