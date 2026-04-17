import type { DateGroup } from "@/types/review";
import { ReviewGroup } from "./ReviewGroup";

interface ReviewListProps {
  groups: DateGroup[];
}

export function ReviewList({ groups }: ReviewListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-7 text-muted-foreground"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="text-sm font-bold text-foreground">No reviews found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {groups.map((group) => (
        <ReviewGroup key={group.label} group={group} />
      ))}
    </div>
  );
}
