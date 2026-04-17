/**
 * Raw review shape returned by the Appfigures reviews API.
 * Documented at https://docs.appfigures.com/api/reference/v2/reviews.
 */
export interface Review {
  id: string;
  author: string;
  title: string;
  review: string;
  original_title: string;
  original_review: string;
  stars: string;
  iso: string;
  version: string;
  date: string;
  product: number;
  vendor_id: string;
  weight: number;
  predicted_langs: string[];
}

export interface ReviewsResponse {
  total: number;
  pages: number;
  this_page: number;
  reviews: Review[];
}

/** Sort orders exposed in the UI (map to API `sort` param). */
export const SORT_ORDERS = ["newest", "oldest", "helpful"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_SORT: SortOrder = "newest";

/** Valid rating values (single-select) — stored as string to match API. */
export const RATING_VALUES = ["1", "2", "3", "4", "5"] as const;
export type Rating = (typeof RATING_VALUES)[number];

/**
 * Filters exposed in the UI. All are optional — the URL encodes only
 * non-default values, so a "clean" URL has no query string at all.
 */
export interface ReviewFilters {
  q?: string;
  stars?: string;      // comma-separated ratings, e.g. "4,5"
  lang?: string;       // ISO 639-1 code from predicted_langs, e.g. "en", "ja"
  sort?: SortOrder;
}

/** Extra knobs passed by the data layer, never persisted to URL. */
export interface ReviewRequest extends ReviewFilters {
  page?: number;
  count?: number;
}

export interface DateGroup {
  label: string;
  reviews: Review[];
}
