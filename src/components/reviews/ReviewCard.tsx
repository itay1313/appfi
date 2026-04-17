import { StarRating } from "./StarRating";

interface ReviewCardProps {
  title: string;
  body: string;
  author: string;
  stars: number;
  date: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewCard({ title, body, author, stars, date }: ReviewCardProps) {
  return (
    <article className="group rounded-2xl border border-border/50 bg-card p-5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <StarRating rating={stars} size="sm" />
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {title || "No title"}
          </h3>
        </div>
      </div>

      {body && (
        <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
        <span className="font-medium text-muted-foreground">{author}</span>
        <span className="text-border">·</span>
        <time dateTime={date}>{formatDate(date)}</time>
      </div>
    </article>
  );
}
