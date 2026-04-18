import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 0;

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${safeRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            iconSize,
            "transition-colors",
            i < safeRating
              ? "fill-star text-star"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}
