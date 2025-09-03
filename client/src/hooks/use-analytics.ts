import { useQuery } from "@tanstack/react-query";

export function useAnalytics() {
  const statsQuery = useQuery({
    queryKey: ["/api/analytics/stats"],
    staleTime: 60000, // 1 minute
  });

  const sentimentQuery = useQuery({
    queryKey: ["/api/analytics/sentiment"],
    staleTime: 60000, // 1 minute
  });

  const categoriesQuery = useQuery({
    queryKey: ["/api/analytics/categories"],
    staleTime: 60000, // 1 minute
  });

  return {
    data: {
      stats: statsQuery.data,
      sentiment: sentimentQuery.data,
      categories: categoriesQuery.data,
    },
    isLoading: statsQuery.isLoading || sentimentQuery.isLoading || categoriesQuery.isLoading,
    error: statsQuery.error || sentimentQuery.error || categoriesQuery.error,
  };
}
