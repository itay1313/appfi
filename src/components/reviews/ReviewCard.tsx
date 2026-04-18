import { lazy, Suspense } from "react";
import { StarRating } from "./StarRating";
import type { Review } from "@/types/review";

// ReviewModal is only needed after a user click — lazy-load it so its
// code (dialog + Base UI) stays out of the initial JS parse.
const ReviewModal = lazy(() =>
  import("./ReviewModal").then((m) => ({ default: m.ReviewModal }))
);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const stars = Math.round(Number(review.stars));

  return (
    <Suspense
      fallback={
        <article className="cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
        </article>
      }
    >
      <ReviewModal review={review}>
        <article className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-px">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <StarRating rating={stars} size="sm" />
              <h3 className="text-base font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                {review.title || "No title"}
              </h3>
            </div>
          </div>

          {review.review && (
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {review.review}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-muted-foreground">{review.author}</span>
            <span className="text-border">·</span>
            <time dateTime={review.date}>{formatDate(review.date)}</time>
          </div>
        </article>
      </ReviewModal>
    </Suspense>
  );
}
