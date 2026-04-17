import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  DEFAULT_SORT,
  RATING_VALUES,
  SORT_ORDERS,
  type ReviewFilters,
  type SortOrder,
} from "@/types/review";

/**
 * Schema used to validate incoming URL params. Invalid values are dropped
 * silently (per spec: "Invalid values should fall back to defaults").
 */
const ratingsSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const valid = new Set<string>(RATING_VALUES);
    const parts = val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => valid.has(s));
    // De-duplicate + keep ascending order for a stable URL.
    const unique = Array.from(new Set(parts)).sort();
    return unique.length ? unique.join(",") : undefined;
  });

const langSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    // ISO 639-1 (2-3 letters, letters only). Normalize to lowercase.
    const trimmed = val.trim().toLowerCase();
    return /^[a-z]{2,3}$/.test(trimmed) ? trimmed : undefined;
  });

const sortSchema = z
  .string()
  .optional()
  .transform((val): SortOrder | undefined => {
    if (!val) return undefined;
    return (SORT_ORDERS as readonly string[]).includes(val)
      ? (val as SortOrder)
      : undefined;
  });

/**
 * Central source of truth for review filters. Reads URL search params into
 * a typed `ReviewFilters`, and writes changes back to the URL so browser
 * history + shareable URLs work naturally.
 */
export function useReviewFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ReviewFilters = useMemo(() => {
    return {
      q: searchParams.get("q")?.trim() || undefined,
      stars: ratingsSchema.parse(searchParams.get("stars") ?? undefined),
      lang: langSchema.parse(searchParams.get("lang") ?? undefined),
      sort: sortSchema.parse(searchParams.get("sort") ?? undefined),
    };
  }, [searchParams]);

  /** Low-level updater that takes a single key → value patch. */
  const patch = useCallback(
    (key: keyof ReviewFilters, value: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value.trim()) {
            next.set(key, value.trim());
          } else {
            next.delete(key);
          }
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const setQuery = useCallback((q: string) => patch("q", q), [patch]);
  const setStars = useCallback(
    (stars: string | undefined) => patch("stars", stars),
    [patch]
  );
  const setLang = useCallback(
    (lang: string | undefined) => patch("lang", lang),
    [patch]
  );
  const setSort = useCallback(
    (sort: SortOrder) =>
      patch("sort", sort === DEFAULT_SORT ? undefined : sort),
    [patch]
  );
  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  const effectiveSort: SortOrder = filters.sort ?? DEFAULT_SORT;
  const hasActiveFilters = Boolean(filters.q || filters.stars);

  return {
    filters,
    effectiveSort,
    hasActiveFilters,
    setQuery,
    setStars,
    setLang,
    setSort,
    clearAll,
  } as const;
}
