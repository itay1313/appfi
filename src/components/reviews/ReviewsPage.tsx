import { useMemo } from "react";
import { useReviewFilters } from "@/hooks/use-review-filters";
import { useReviews } from "@/hooks/use-reviews";
import { groupReviewsByDate } from "@/lib/date-groups";
import { primaryLanguage } from "@/lib/languages";
import { Hero } from "./Hero";
import { SearchFilters } from "./SearchFilters";
import { TotalsLabel } from "./TotalsLabel";
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
    isFetchingNextPage,
    hasNextPage,
    error,
    loadMore,
    retry,
  } = useReviews(filters, effectiveSort);

  // Client-side language filter: the API doesn't support filtering by
  // predicted_langs, so we do it after the response arrives.
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
      <main className="mx-auto w-full max-w-5xl px-6 py-8">

      <div className="mb-6">
        <SearchFilters
          query={filters.q ?? ""}
          stars={filters.stars}
          lang={filters.lang}
          onQueryChange={setQuery}
          onStarsChange={setStars}
          onLangChange={setLang}
        />
      </div>

      <div className="mb-6">
        <TotalsLabel
          total={total}
          isLoading={isInitialLoading}
          hasFilters={hasActiveFilters}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => retry()} />
      ) : isInitialLoading ? (
        <ReviewsSkeleton />
      ) : (
        <>
          <ReviewList groups={groups} />
          <div className="mt-8">
            <LoadMoreButton
              onClick={() => loadMore()}
              isLoading={isFetchingNextPage}
              hasMore={hasNextPage}
              loadedCount={filteredReviews.length}
              total={total}
            />
          </div>
        </>
      )}
      </main>
    </>
  );
}
