import type { Review, DateGroup } from "@/types/review";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday = 1 of the ISO week. Returns start-of-day for that Monday. */
function getMondayOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface DateBucket {
  label: string;
  /** Inclusive start. */
  start: Date;
  /** Exclusive end. */
  end: Date;
}

/**
 * Builds buckets per spec:
 *   Today · Yesterday · This Week · Last Week · This Month · Last Month
 *   then month-year back through `monthsBack` months.
 *
 * `monthsBack` is derived from the data we're grouping so old reviews
 * don't fall off the list.
 */
function buildBuckets(now: Date, monthsBack: number): DateBucket[] {
  const today = startOfDay(now);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const thisMonday = getMondayOfWeek(today);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = thisMonthStart; // exclusive upper bound

  const buckets: DateBucket[] = [
    { label: "Today", start: today, end: tomorrow },
    { label: "Yesterday", start: yesterday, end: today },
  ];

  // "This Week" excludes today and yesterday → Monday up to yesterday.
  if (thisMonday < yesterday) {
    buckets.push({ label: "This Week", start: thisMonday, end: yesterday });
  }

  // "Last Week" → prev Monday up to (not including) this Monday.
  buckets.push({ label: "Last Week", start: lastMonday, end: thisMonday });

  // "This Month" → 1st of month up to (not including) last Monday,
  // only if there are days between them.
  if (thisMonthStart < lastMonday) {
    buckets.push({
      label: "This Month",
      start: thisMonthStart,
      end: lastMonday,
    });
  }

  // "Last Month" → 1st of last month up to 1st of this month.
  buckets.push({
    label: "Last Month",
    start: lastMonthStart,
    end: lastMonthEnd,
  });

  // Older months labeled "MMM YYYY".
  for (let i = 2; i <= monthsBack; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    buckets.push({
      label: formatMonthYear(monthStart),
      start: monthStart,
      end: monthEnd,
    });
  }

  return buckets;
}

/**
 * Pure grouping: takes a list of reviews → labeled date sections, in order,
 * with empty sections omitted (per spec). Dynamically grows month buckets
 * to cover the oldest review so nothing is dropped.
 */
export function groupReviewsByDate(reviews: Review[]): DateGroup[] {
  if (reviews.length === 0) return [];

  const now = new Date();
  const today = startOfDay(now);

  // Figure out how far back we need month buckets (min 2 for "Last Month").
  let oldest = today;
  for (const r of reviews) {
    const d = new Date(r.date);
    if (!Number.isNaN(d.getTime()) && d < oldest) oldest = d;
  }
  const monthsDiff =
    (today.getFullYear() - oldest.getFullYear()) * 12 +
    (today.getMonth() - oldest.getMonth());
  const monthsBack = Math.max(2, monthsDiff + 1);

  const buckets = buildBuckets(now, monthsBack);
  const byLabel = new Map<string, Review[]>(
    buckets.map((b) => [b.label, [] as Review[]])
  );

  for (const review of reviews) {
    const d = new Date(review.date);
    if (Number.isNaN(d.getTime())) continue;
    for (const bucket of buckets) {
      if (d >= bucket.start && d < bucket.end) {
        byLabel.get(bucket.label)!.push(review);
        break;
      }
    }
  }

  return buckets
    .filter((b) => byLabel.get(b.label)!.length > 0)
    .map((b) => ({ label: b.label, reviews: byLabel.get(b.label)! }));
}
