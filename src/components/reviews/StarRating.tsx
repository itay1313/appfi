import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            "transition-colors",
            i < rating
              ? "fill-star text-star"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}
