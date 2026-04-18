import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  loadedCount: number;
  total: number;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
  loadedCount,
  total,
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <Button
        variant="outline"
        onClick={onClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className="h-11 rounded-xl px-8 text-sm font-medium shadow-xs"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading…
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 size-4" />
            Load More
          </>
        )}
      </Button>
      <p className="text-xs tabular-nums text-muted-foreground">
        Showing {loadedCount.toLocaleString()} of {total.toLocaleString()} reviews
      </p>
    </div>
  );
}
