import { SlidersHorizontal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStats, StarDistItem } from "@/hooks/use-review-stats";
import { languageFlag, languageName } from "@/lib/languages";
import type { Review } from "@/types/review";
import { useMemo } from "react";
import { useCountUp } from "@/hooks/use-count-up";

/* ─── Helpers ────────────────────────────────────────────────────── */

const STAR_BAR_COLOR: Record<number, string> = {
  5: "bg-green-500",
  4: "bg-emerald-400",
  3: "bg-amber-400",
  2: "bg-orange-400",
  1: "bg-red-500",
};

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} style={style} />
  );
}

/* ─── Stat tile ──────────────────────────────────────────────────── */

interface StatTileProps {
  label: string;
  /** Raw numeric value — animated from 0 → target on load */
  rawValue: number;
  /** Format the animated intermediate value into the display string */
  format: (n: number) => string;
  sub?: string;
  isLoading?: boolean;
  valueClassName?: string;
}

function StatTile({ label, rawValue, format, sub, isLoading, valueClassName }: StatTileProps) {
  const animated = useCountUp(rawValue, !isLoading);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-xs">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className={cn("text-2xl font-extrabold leading-none tabular-nums tracking-tight", valueClassName)}>
          {format(animated)}
        </p>
      )}
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

/* ─── Distribution row ───────────────────────────────────────────── */

interface DistRowProps {
  stars: number;
  percent: number;
  total: number;
  isLoading: boolean;
}

function DistRow({ stars, percent, total, isLoading }: DistRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex w-9 shrink-0 items-center justify-end gap-0.5">
        <span className="text-xs font-bold tabular-nums text-muted-foreground">{stars}</span>
        <Star className="size-3 shrink-0 fill-star text-star" aria-hidden="true" />
      </div>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
            STAR_BAR_COLOR[stars]
          )}
          style={{ width: isLoading ? "0%" : `${percent}%` }}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {isLoading ? "—" : `${percent.toFixed(1)}%`}
      </span>
      <span className="hidden w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
        {isLoading ? "" : total.toLocaleString()}
      </span>
    </div>
  );
}

/* ─── Language bar ───────────────────────────────────────────────── */

function TopLanguagesCard({ reviews, isLoading }: { reviews: Review[]; isLoading: boolean }) {
  const topLangs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reviews) {
      const lang = r.predicted_langs?.[0];
      if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      // Only show languages we have a proper name for (filters out obscure codes like "an")
      .filter(([lang]) => languageName(lang) !== lang.toUpperCase())
      .slice(0, 5);
  }, [reviews]);

  const total = topLangs.reduce((s, [, n]) => s + n, 0);

  // Show skeleton while reviews are loading — keeps layout stable (no pop-in)
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card px-5 py-4 shadow-xs">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Top Languages
        </p>
        <div className="space-y-3">
          {[60, 40, 25, 20, 12].map((w) => (
            <div key={w} className="flex items-center gap-2.5">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-2 flex-1 rounded-full" style={{ maxWidth: `${w}%` }} />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topLangs.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card px-5 py-4 shadow-xs">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Top Languages <span className="ml-1 font-normal normal-case">(loaded reviews)</span>
      </p>
      <div className="space-y-2">
        {topLangs.map(([lang, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={lang} className="flex items-center gap-2.5">
              <div className="flex w-24 shrink-0 items-center gap-1.5">
                <span className="text-base leading-none">{languageFlag(lang)}</span>
                <span className="text-xs font-medium text-foreground truncate">
                  {languageName(lang)}
                </span>
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */

interface InsightsBarProps {
  stats: ReviewStats;
  /** All loaded reviews after client-side filters (lang, etc.) */
  filteredReviews: Review[];
  /** API-level total for current query+stars filters (not lang) */
  apiTotal: number;
  /** Any filter (stars, lang, query) is currently active */
  hasActiveFilters: boolean;
  /** Lang filter specifically is active (client-side only, so total is partial) */
  hasLangFilter: boolean;
  /** True while the first page of reviews is still loading */
  isReviewsLoading: boolean;
}

/** Derive stats from the currently loaded+filtered reviews. */
function computeStatsFromReviews(
  reviews: Review[],
  apiTotal: number,
  hasLangFilter: boolean,
): ReviewStats {
  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const s = Math.round(Number(r.stars));
    if (s >= 1 && s <= 5) starCounts[s]++;
  }
  const n = reviews.length;
  const weightedSum = [1, 2, 3, 4, 5].reduce((acc, s) => acc + s * starCounts[s], 0);
  const avg = n > 0 ? weightedSum / n : 0;
  const happy = starCounts[4] + starCounts[5];
  const critical = starCounts[1];

  // Lang is client-side: only count what's been loaded. Everything else is accurate from the API.
  const grandTotal = hasLangFilter ? n : apiTotal;

  const distribution: StarDistItem[] = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    total: starCounts[s],
    percent: n > 0 ? (starCounts[s] / n) * 100 : 0,
  }));

  return {
    isLoading: false,
    grandTotal,
    averageRating: avg,
    satisfactionPercent: n > 0 ? (happy / n) * 100 : 0,
    criticalPercent: n > 0 ? (critical / n) * 100 : 0,
    distribution,
  };
}

export function InsightsBar({
  stats,
  filteredReviews,
  apiTotal,
  hasActiveFilters,
  hasLangFilter,
  isReviewsLoading,
}: InsightsBarProps) {
  // When filters are active, derive stats from the loaded+filtered reviews.
  // Fall back to the global corpus stats when nothing is filtered.
  const activeStats = useMemo(() => {
    if (!hasActiveFilters || filteredReviews.length === 0) return null;
    return computeStatsFromReviews(filteredReviews, apiTotal, hasLangFilter);
  }, [filteredReviews, hasActiveFilters, hasLangFilter, apiTotal]);

  const displayStats = activeStats ?? stats;
  const { isLoading, grandTotal, averageRating, satisfactionPercent, criticalPercent, distribution } = displayStats;

  // Sub-label for Total Reviews tile: clarify partial count when lang-filtered
  const totalSub = hasActiveFilters && hasLangFilter ? "in loaded reviews" : undefined;

  return (
    <div className="mb-6 space-y-3">
      {/* ── Filtered-view badge ──────────────────────────── */}
      <div className="flex h-5 items-center justify-end">
        {hasActiveFilters && activeStats && (
          <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <SlidersHorizontal className="size-3" aria-hidden="true" />
            Filtered view
          </span>
        )}
      </div>

      {/* ── Stat tiles ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total Reviews"
          rawValue={grandTotal}
          format={(n) => Math.round(n).toLocaleString()}
          sub={totalSub}
          isLoading={isLoading}
        />
        <StatTile
          label="Avg Rating"
          rawValue={averageRating}
          format={(n) => n.toFixed(2)}
          sub="out of 5.0"
          isLoading={isLoading}
        />
        <StatTile
          label="Satisfaction"
          rawValue={satisfactionPercent}
          format={(n) => `${n.toFixed(1)}%`}
          sub="rated 4★ or 5★"
          isLoading={isLoading}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <StatTile
          label="Critical"
          rawValue={criticalPercent}
          format={(n) => `${n.toFixed(1)}%`}
          sub="rated 1★"
          isLoading={isLoading}
          valueClassName="text-red-600 dark:text-red-400"
        />
      </div>

      {/* ── Rating distribution + Language breakdown ─────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Distribution */}
        <div className="rounded-xl border border-border/50 bg-card px-5 py-4 shadow-xs">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Rating Distribution
          </p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((n) => {
              const stat = distribution.find((d) => d.stars === n);
              return (
                <DistRow
                  key={n}
                  stars={n}
                  percent={stat?.percent ?? 0}
                  total={stat?.total ?? 0}
                  isLoading={isLoading}
                />
              );
            })}
          </div>
        </div>

        {/* Top Languages */}
        <TopLanguagesCard reviews={filteredReviews} isLoading={isReviewsLoading} />
      </div>
    </div>
  );
}
