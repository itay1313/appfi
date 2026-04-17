import { useMemo } from "react";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchReviews, ApiError } from "@/api/reviews";
import type { ReviewFilters, ReviewsResponse, SortOrder } from "@/types/review";

export const REVIEWS_PER_PAGE = 25;

/** Stable cache key. `lang` is excluded — it's a client-side filter only. */
function reviewsQueryKey(filters: ReviewFilters, sort: SortOrder) {
  return [
    "reviews",
    {
      q: filters.q ?? "",
      stars: filters.stars ?? "",
      sort,
    },
  ] as const;
}

export function humanizeError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something unexpected went wrong.";
}

/**
 * Data hook — wraps TanStack Query's infinite query with a friendlier
 * surface for the UI. `sort` is passed separately from the stored filters
 * so the URL-state hook can keep "newest" implicit (no URL param).
 */
export function useReviews(filters: ReviewFilters, sort: SortOrder) {
  const query = useInfiniteQuery<
    ReviewsResponse,
    Error,
    { pages: ReviewsResponse[]; pageParams: number[] },
    ReturnType<typeof reviewsQueryKey>,
    number
  >({
    queryKey: reviewsQueryKey(filters, sort),
    queryFn: ({ pageParam, signal }) =>
      fetchReviews(
        { ...filters, sort, page: pageParam, count: REVIEWS_PER_PAGE },
        signal
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.this_page < lastPage.pages ? lastPage.this_page + 1 : undefined,
    // Smooth UX: render previous data while new filter results load in.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 2,
  });

  // Flatten pages into a single list. useMemo keeps downstream memos stable.
  const reviews = useMemo(
    () => query.data?.pages.flatMap((p) => p.reviews) ?? [],
    [query.data]
  );

  const firstPage = query.data?.pages[0];
  const total = firstPage?.total ?? 0;

  return {
    reviews,
    total,
    isInitialLoading: query.isPending,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error ? humanizeError(query.error) : null,
    loadMore: query.fetchNextPage,
    retry: query.refetch,
  };
}
