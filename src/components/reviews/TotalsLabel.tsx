import { MessageSquareText } from "lucide-react";

interface TotalsLabelProps {
  total: number;
  isLoading: boolean;
  hasFilters: boolean;
}

export function TotalsLabel({ total, isLoading, hasFilters }: TotalsLabelProps) {
  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MessageSquareText className="size-4" />
      <span className="tabular-nums">
        <span className="font-semibold text-foreground">
          {total.toLocaleString()}
        </span>{" "}
        {hasFilters ? "matching reviews" : "total reviews"}
      </span>
    </div>
  );
}
