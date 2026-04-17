import type { Review } from "@/types/review";

/** Normalize a review's `stars` string into a 0–5 integer. */
export function parseStars(value: string | number | undefined): number {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

/**
 * Tone bucket used to color-code stars, badges, and card accents.
 * We split 3 stars into its own "warn" bucket because the UX difference
 * between 3★ ("meh") and 4-5★ ("happy") is larger than the half-point gap.
 */
export type RatingTone = "negative" | "warn" | "positive";

export function ratingTone(stars: number): RatingTone {
  if (stars <= 2) return "negative";
  if (stars === 3) return "warn";
  return "positive";
}

/** Distribution counts 1★..5★ from a list of reviews. Index 0 = 1★. */
export interface RatingCounts {
  counts: [number, number, number, number, number];
  total: number;
  /** Weighted average across the provided list. `null` when no reviews. */
  average: number | null;
}

export function computeRatingCounts(reviews: Review[]): RatingCounts {
  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const s = parseStars(r.stars);
    if (s >= 1 && s <= 5) {
      counts[s - 1] += 1;
      sum += s;
    }
  }
  const total = counts.reduce((a, b) => a + b, 0);
  return {
    counts,
    total,
    average: total > 0 ? sum / total : null,
  };
}
