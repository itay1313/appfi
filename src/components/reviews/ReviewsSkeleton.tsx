import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsSkeleton() {
  return (
    <div className="grid gap-8">
      {[1, 2].map((group) => (
        <div key={group}>
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-5 w-8 rounded-full" />
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: group === 1 ? 3 : 2 }, (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-card p-5"
              >
                <div className="mb-3 space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-4 w-48 rounded-md" />
                </div>
                <div className="mb-4 space-y-1.5">
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
