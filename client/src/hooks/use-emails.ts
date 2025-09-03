import { useQuery } from "@tanstack/react-query";

interface UseEmailsOptions {
  query?: string;
  priority?: "urgent" | "normal";
  sentiment?: "positive" | "negative" | "neutral";
  limit?: number;
  offset?: number;
}

export function useEmails(options: UseEmailsOptions = {}) {
  const { query, priority, sentiment, limit = 50, offset = 0 } = options;
  
  const searchParams = new URLSearchParams();
  if (query) searchParams.append("query", query);
  if (priority) searchParams.append("priority", priority);
  if (sentiment) searchParams.append("sentiment", sentiment);
  searchParams.append("limit", limit.toString());
  searchParams.append("offset", offset.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `/api/emails?${queryString}` : "/api/emails";

  return useQuery({
    queryKey: [url],
    staleTime: 30000, // 30 seconds
  });
}

export function useEmail(emailId: string | undefined) {
  return useQuery({
    queryKey: [`/api/emails/${emailId}`],
    enabled: !!emailId,
  });
}
