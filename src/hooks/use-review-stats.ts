import { useQueries } from "@tanstack/react-query";
import { fetchReviews } from "@/api/reviews";

const STARS = [1, 2, 3, 4, 5] as const;

export interface StarDistItem {
  stars: number;
  total: number;
  percent: number;
}

export interface ReviewStats {
  isLoading: boolean;
  grandTotal: number;
  averageRating: number;
  /** % of reviews rated 4 or 5 stars */
  satisfactionPercent: number;
  /** % of reviews rated 1 star */
  criticalPercent: number;
  distribution: StarDistItem[];
}

/**
 * Fetches the global (unfiltered) star distribution with 5 lean parallel
 * API calls (count=1 — only the `total` field is used from each response).
 * Results are cached for 5 minutes so subsequent page navigations are free.
 */
export function useReviewStats(): ReviewStats {
  const queries = useQueries({
    queries: STARS.map((stars) => ({
      queryKey: ["review-stats", stars] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchReviews({ stars: String(stars), count: 1, page: 1 }, signal),
      staleTime: 5 * 60_000,
      gcTime:    10 * 60_000,
    })),
  });

  const isLoading = queries.some((q) => q.isPending);

  const totals = STARS.map((stars, i) => ({
    stars,
    total: queries[i].data?.total ?? 0,
  }));

  const grandTotal     = totals.reduce((s, t) => s + t.total, 0);
  const weightedSum    = totals.reduce((s, t) => s + t.stars * t.total, 0);
  const averageRating  = grandTotal > 0 ? weightedSum / grandTotal : 0;

  const oneStarTotal   = totals.find((t) => t.stars === 1)?.total ?? 0;
  const happyTotal     = totals.filter((t) => t.stars >= 4).reduce((s, t) => s + t.total, 0);

  const distribution: StarDistItem[] = totals.map((t) => ({
    ...t,
    percent: grandTotal > 0 ? (t.total / grandTotal) * 100 : 0,
  }));

  return {
    isLoading,
    grandTotal,
    averageRating,
    satisfactionPercent: grandTotal > 0 ? (happyTotal    / grandTotal) * 100 : 0,
    criticalPercent:     grandTotal > 0 ? (oneStarTotal  / grandTotal) * 100 : 0,
    distribution,
  };
}
