import { Star, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStats } from "@/hooks/use-review-stats";
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  );
}

/* ─── Stat tile ──────────────────────────────────────────────────── */

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  /** Raw numeric value — animated from 0 → target on load */
  rawValue: number;
  /** Format the animated intermediate value into the display string */
  format: (n: number) => string;
  sub?: string;
  isLoading?: boolean;
  valueClassName?: string;
}

function StatTile({ icon, label, rawValue, format, sub, isLoading, valueClassName }: StatTileProps) {
  const animated = useCountUp(rawValue, !isLoading);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-xs">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className={cn("text-[1.6rem] font-extrabold leading-none tabular-nums tracking-tight", valueClassName)}>
          {format(animated)}
        </p>
      )}
      {sub && (
        <p className="text-[11px] text-muted-foreground">{sub}</p>
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
      <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {isLoading ? "—" : `${percent.toFixed(1)}%`}
      </span>
      <span className="hidden w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground/50 sm:block">
        {isLoading ? "" : total.toLocaleString()}
      </span>
    </div>
  );
}

/* ─── Language bar ───────────────────────────────────────────────── */

function TopLanguagesCard({ reviews }: { reviews: Review[] }) {
  const topLangs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reviews) {
      const lang = r.predicted_langs?.[0];
      if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [reviews]);

  const total = topLangs.reduce((s, [, n]) => s + n, 0);

  if (topLangs.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card px-5 py-4 shadow-xs">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Top Languages <span className="ml-1 font-normal normal-case opacity-50">(loaded reviews)</span>
      </p>
      <div className="space-y-2">
        {topLangs.map(([lang, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={lang} className="flex items-center gap-2.5">
              <div className="flex w-24 shrink-0 items-center gap-1.5">
                <span className="text-base leading-none">{languageFlag(lang)}</span>
                <span className="text-xs font-medium text-foreground/80 truncate">
                  {languageName(lang)}
                </span>
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
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
  /** Currently loaded reviews — used for language breakdown */
  reviews: Review[];
}

export function InsightsBar({ stats, reviews }: InsightsBarProps) {
  const { isLoading, grandTotal, averageRating, satisfactionPercent, criticalPercent, distribution } = stats;

  return (
    <div className="mb-6 space-y-3">
      {/* ── Stat tiles ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
          label="Total Reviews"
          rawValue={grandTotal}
          format={(n) => Math.round(n).toLocaleString()}
          isLoading={isLoading}
        />
        <StatTile
          icon={<Star className="size-3.5 fill-star text-star" aria-hidden="true" />}
          label="Avg Rating"
          rawValue={averageRating}
          format={(n) => n.toFixed(2)}
          sub="out of 5.0"
          isLoading={isLoading}
        />
        <StatTile
          icon={<TrendingUp className="size-3.5 text-green-500" aria-hidden="true" />}
          label="Satisfaction"
          rawValue={satisfactionPercent}
          format={(n) => `${n.toFixed(1)}%`}
          sub="rated 4★ or 5★"
          isLoading={isLoading}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <StatTile
          icon={<AlertTriangle className="size-3.5 text-red-500" aria-hidden="true" />}
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
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
        <TopLanguagesCard reviews={reviews} />
      </div>
    </div>
  );
}
