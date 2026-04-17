import { StarRating } from "./StarRating";
import { ReviewModal } from "./ReviewModal";
import type { Review } from "@/types/review";

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
    <ReviewModal review={review}>
      <article className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-px">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <StarRating rating={stars} size="sm" />
            <h3 className="text-[15px] font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
              {review.title || "No title"}
            </h3>
          </div>
        </div>

        {review.review && (
          <p className="mb-4 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {review.review}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <span className="font-medium text-muted-foreground">{review.author}</span>
          <span className="text-border">·</span>
          <time dateTime={review.date}>{formatDate(review.date)}</time>
        </div>
      </article>
    </ReviewModal>
  );
}
