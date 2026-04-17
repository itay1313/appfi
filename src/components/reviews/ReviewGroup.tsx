import type { DateGroup } from "@/types/review";
import { ReviewCard } from "./ReviewCard";

interface ReviewGroupProps {
  group: DateGroup;
}

export function ReviewGroup({ group }: ReviewGroupProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-sm font-bold tracking-tight text-foreground">
          {group.label}
        </h2>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {group.reviews.length}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <div className="grid gap-3">
        {group.reviews.map((review) => (
          <ReviewCard
            key={review.id}
            title={review.title}
            body={review.review}
            author={review.author}
            stars={Math.round(Number(review.stars))}
            date={review.date}
          />
        ))}
      </div>
    </section>
  );
}
