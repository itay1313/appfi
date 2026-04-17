import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" />
      </div>
      <p className="text-sm font-bold text-foreground">Something went wrong</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 rounded-lg"
        >
          <RefreshCw className="mr-2 size-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
