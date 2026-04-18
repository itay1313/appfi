import { useMemo } from "react";
import { useReviewFilters } from "@/hooks/use-review-filters";
import { useReviews } from "@/hooks/use-reviews";
import { useReviewStats } from "@/hooks/use-review-stats";
import { groupReviewsByDate } from "@/lib/date-groups";
import { primaryLanguage } from "@/lib/languages";
import { Hero } from "./Hero";
import { SearchFilters } from "./SearchFilters";
import { InsightsBar } from "./InsightsBar";
import { ReviewList } from "./ReviewList";
import { ReviewsSkeleton } from "./ReviewsSkeleton";
import { ErrorState } from "./ErrorState";
import { LoadMoreButton } from "./LoadMoreButton";

export function ReviewsPage() {
  const {
    filters,
    effectiveSort,
    hasActiveFilters,
    setQuery,
    setStars,
    setLang,
  } = useReviewFilters();

  const {
    reviews,
    total,
    isInitialLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    loadMore,
    retry,
  } = useReviews(filters, effectiveSort);

  const stats = useReviewStats();

  // Client-side language filter: the API doesn't support filtering by
  // predicted_langs, so we filter after the response arrives.
  const filteredReviews = useMemo(() => {
    if (!filters.lang) return reviews;
    return reviews.filter(
      (r) => primaryLanguage(r.predicted_langs) === filters.lang
    );
  }, [reviews, filters.lang]);

  const groups = useMemo(
    () => groupReviewsByDate(filteredReviews),
    [filteredReviews]
  );

  return (
    <>
      <Hero />
      {/* ── Fix: <div> not <main> — App.tsx already renders the <main> wrapper ── */}
      <div className="mx-auto w-full max-w-5xl px-6 py-8" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 800px" }}>

        {/* Insights panel */}
        <InsightsBar
          stats={stats}
          filteredReviews={filteredReviews}
          apiTotal={total}
          hasActiveFilters={hasActiveFilters}
          hasLangFilter={!!filters.lang}
          isReviewsLoading={isInitialLoading}
        />

        {/* Filters */}
        <div className="mb-4">
          <SearchFilters
            query={filters.q ?? ""}
            stars={filters.stars}
            lang={filters.lang}
            onQueryChange={setQuery}
            onStarsChange={setStars}
            onLangChange={setLang}
          />
        </div>

        <div className="relative">
          {isFetching && !isInitialLoading && !isFetchingNextPage && (
            <div className="absolute -top-1 right-0 z-10 flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              <svg className="size-3 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Updating…
            </div>
          )}

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : isInitialLoading ? (
          <ReviewsSkeleton />
        ) : (
          <>
            <ReviewList groups={groups} />
            <div className="mt-8">
              <LoadMoreButton
                onClick={loadMore}
                isLoading={isFetchingNextPage}
                hasMore={hasNextPage}
                loadedCount={filteredReviews.length}
                total={total}
              />
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
