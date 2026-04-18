# ItayReviews — Complete Technical Reference

> Everything you need to know to walk through this project confidently in a presentation or interview.

---

## Table of Contents

1. [What This App Is](#1-what-this-app-is)
2. [Tech Stack — What and Why](#2-tech-stack--what-and-why)
3. [Folder Structure](#3-folder-structure)
4. [The API](#4-the-api)
5. [Data Flow — End to End](#5-data-flow--end-to-end)
6. [Every File Explained](#6-every-file-explained)
7. [Key Design Decisions](#7-key-design-decisions)
8. [Requirement Checklist](#8-requirement-checklist)
9. [How to Run It](#9-how-to-run-it)
10. [Likely Interview Questions & Answers](#10-likely-interview-questions--answers)

---

## 1. What This App Is

A web app that lets you **explore 346,000+ user reviews of the ChatGPT iOS app** from the App Store. Users can:

- Search reviews by keyword
- Filter by star rating (1–5)
- Filter by detected language
- See reviews grouped by time period (Today → month-by-month)
- Click any review card to open a full detail modal
- Load more reviews page-by-page
- Share any filtered view via URL
- Toggle dark / light / system theme
- See analytics: average rating, satisfaction rate, critical rate, rating distribution, top languages

The exercise spec asked for items 1–6. Items 7–10 were added to demonstrate production-quality thinking.

---

## 2. Tech Stack — What and Why

| Tool | Version | Why |
|---|---|---|
| **React** | 19 | Required by spec. Used for UI composition. |
| **TypeScript** | 5 | Required by spec. Strict mode — no `any`. |
| **Vite** | 6 | Fast dev server and build. Industry standard for SPAs. |
| **React Router v7** | 7 | `useSearchParams` powers URL state + back/forward. |
| **TanStack Query** | 5 | Infinite pagination, caching, background refetch, loading/error states — all handled with minimal code. |
| **Tailwind CSS v4** | 4 | Utility-first styles. Custom oklch color token system. |
| **Base UI** | 1 | Headless UI primitives (Dialog, DropdownMenu, Input) — fully accessible, fully custom-styled. |
| **Zod** | 3 | URL param validation. Invalid values silently fall back to defaults — never crashes. |
| **Lucide React** | — | Icon set. Tree-shakeable, consistent. |

**Why TanStack Query instead of `useEffect + fetch`?**
It gives infinite pagination (`useInfiniteQuery`), automatic deduplication, background refetch, `keepPreviousData` for smooth filter transitions, and retry logic — all in ~10 lines. Writing this from scratch would be 100+ lines and would miss edge cases.

**Why Base UI instead of shadcn/Radix?**
Base UI is the successor to Radix by the same team (MUI). It ships zero styles — every pixel is ours. This avoids fighting specificity wars with pre-baked styles (which was the exact problem with `Select` height overrides earlier in this project).

**Why Zod for URL params?**
The spec explicitly requires: *"Invalid values should fall back to defaults. The app should not crash."* Zod schemas handle that in one `.parse()` call per param.

---

## 3. Folder Structure

```
src/
├── api/
│   └── reviews.ts          # All API logic: buildQuery, fetchReviews, ApiError
│
├── app/
│   ├── ErrorBoundary.tsx   # Class component — catches render-time crashes
│   └── Providers.tsx       # Composes: ErrorBoundary > ThemeProvider > QueryClient > BrowserRouter
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Logo + nav (Top Apps link) + theme toggle
│   │   ├── Footer.tsx          # Copyright + itaycode.com link
│   │   └── BackgroundCanvas.tsx # Subtle animated background texture
│   │
│   ├── reviews/
│   │   ├── ReviewsPage.tsx     # Orchestrator: wires hooks → components
│   │   ├── Hero.tsx            # Top banner with DotField animation
│   │   ├── InsightsBar.tsx     # Stat tiles + distribution chart + top languages
│   │   ├── SearchFilters.tsx   # Search input + language dropdown + rating pills
│   │   ├── TotalsLabel.tsx     # "X total/matching reviews"
│   │   ├── ReviewList.tsx      # Renders groups; shows empty state
│   │   ├── ReviewGroup.tsx     # One date-group section
│   │   ├── ReviewCard.tsx      # Single review card (clickable)
│   │   ├── ReviewModal.tsx     # Full review detail modal
│   │   ├── StarRating.tsx      # Row of star icons
│   │   ├── ReviewsSkeleton.tsx # Loading placeholder cards
│   │   ├── LoadMoreButton.tsx  # Load more + "Showing N of M" counter
│   │   └── ErrorState.tsx      # API error UI with retry
│   │
│   └── ui/
│       ├── DotField.tsx        # Canvas-based interactive dot animation
│       ├── dialog.tsx          # Base UI Dialog wrapper (backdrop + popup + close btn)
│       ├── dropdown-menu.tsx   # Base UI Menu wrapper (trigger + content + items)
│       ├── input.tsx           # Base UI Input wrapper
│       └── button.tsx          # Styled button component
│
├── hooks/
│   ├── use-reviews.ts          # TanStack useInfiniteQuery — fetches paginated reviews
│   ├── use-review-filters.ts   # URL ↔ filter state with Zod validation
│   ├── use-review-stats.ts     # 5 parallel API calls → star distribution analytics
│   └── use-theme.ts            # Light/dark/system theme with localStorage persistence
│
├── lib/
│   ├── date-groups.ts          # Pure function: reviews[] → DateGroup[] (the spec's grouping logic)
│   ├── languages.ts            # ISO 639-1 → name/flag; countryFlag from review.iso
│   └── utils.ts                # cn() (clsx + tailwind-merge)
│
├── types/
│   └── review.ts               # All shared TypeScript types and constants
│
├── App.tsx                     # Route setup + layout shell
├── main.tsx                    # React root mount
└── index.css                   # Tailwind v4 + oklch color system
```

---

## 4. The API

### Base URL

```
GET https://appfigures.com/_u/careers/api/reviews
```

This is a special careers proxy that bypasses auth and CORS. It's pre-scoped to the ChatGPT iOS app — no `products` param needed.

### Parameters

| Param | Type | What it does |
|---|---|---|
| `q` | string | Full-text keyword search across title + body |
| `stars` | string | Comma-separated ratings: `"1"`, `"5"`, `"4,5"` |
| `sort` | string | `-date` (newest), `date` (oldest), `-weight` (most helpful) |
| `count` | number | Reviews per page. We use `25`. |
| `page` | number | 1-based page number |

**Note:** The `lang` URL param in the Appfigures API triggers *translation*, not filtering. Language filtering in this app is done **client-side** using the `predicted_langs` field on each review.

### Response shape

```ts
{
  total: number;      // Total matching reviews (not just this page)
  pages: number;      // Total number of pages
  this_page: number;  // Current page (1-based)
  reviews: Review[];  // Array of review objects
}
```

### Review object (key fields)

```ts
{
  id: string;               // Unique review ID
  author: string;           // Display name of reviewer
  title: string;            // Review headline
  review: string;           // Full review body
  original_title: string;   // Non-translated title (if translated)
  original_review: string;  // Non-translated body (if translated)
  stars: string;            // "1" – "5" (comes as string from API)
  iso: string;              // 2-letter country code ("us", "jp", etc.)
  version: string;          // App version reviewed ("6.8.1", etc.)
  date: string;             // ISO 8601 date string
  vendor_id: string;        // Used to build deep link to appfigures.com/reviews/{id}
  weight: number;           // Helpfulness score (used for "helpful" sort)
  predicted_langs: string[]; // Detected language codes, most likely first (["en", "fr"])
}
```

### Example requests

```bash
# Default: newest 25 reviews
GET /reviews?sort=-date&count=25&page=1

# Search for "crash" in 1-star reviews
GET /reviews?q=crash&stars=1&sort=-date&count=25&page=1

# Get total count for 5-star reviews (used by InsightsBar)
GET /reviews?stars=5&count=1&page=1
```

---

## 5. Data Flow — End to End

### Filter change (e.g. user types "crash")

```
User types "crash" in SearchFilters
  → 400ms debounce fires
  → onQueryChange("crash") called
  → useReviewFilters.setQuery("crash")
  → useSearchParams updates URL to ?q=crash   (replace: false → history entry pushed)
  → useReviewFilters re-derives filters from URL
  → useReviews gets new queryKey ["reviews", { q: "crash", stars: "", sort: "newest" }]
  → TanStack Query fires fetchReviews({ q: "crash", count: 25, page: 1 })
  → API returns { total: 1842, reviews: [...25 items] }
  → keepPreviousData shows old reviews while loading (+ spinner shown)
  → new reviews replace old → grouped by date → rendered
```

### Pressing browser Back

```
Browser pops history
  → URL changes back to previous state (e.g. ?q=)
  → useSearchParams detects change
  → useReviewFilters re-derives filters from new URL
  → useReviews reacts to new queryKey
  → cached data shown instantly (staleTime: 60s) or refetched
```

### Load More clicked

```
LoadMoreButton onClick → loadMore() (= query.fetchNextPage)
  → TanStack Query calls fetchReviews({ page: 2, ... })
  → new 25 reviews appended to existing array (not replaced)
  → filteredReviews grows → groups update → new cards appear below existing
```

### Insights on mount

```
useReviewStats mounts
  → useQueries fires 5 parallel requests (stars=1 through stars=5, count=1 each)
  → Only the `total` field from each response is used
  → Derives: grandTotal, averageRating, satisfactionPercent, criticalPercent, distribution
  → Cached for 5 minutes — re-navigating doesn't re-fetch
  → InsightsBar renders stat tiles + animated distribution bars
```

---

## 6. Every File Explained

### `src/api/reviews.ts`
Single-responsibility API layer. Contains:
- `ApiError` — typed error class with `.status` for 4xx vs 5xx distinction
- `buildQuery()` — converts `ReviewRequest` to URLSearchParams. Intentionally omits `lang` (it would translate, not filter)
- `fetchReviews()` — the one fetch call. Handles network errors, non-2xx status, and malformed JSON separately

**Key decision:** `lang` is not sent to the API. The Appfigures `lang` param would translate reviews, not filter them. Language filtering is done client-side on `predicted_langs`.

---

### `src/hooks/use-review-filters.ts`
Single source of truth for all filter state. Reads/writes URL search params.

```ts
// Reading filters from URL:
filters.q     = ?q=crash
filters.stars = ?stars=1
filters.lang  = ?lang=en   (or undefined = all)
filters.sort  = ?sort=oldest (or undefined = newest, not written to URL)
```

- Zod schemas validate each param. An invalid rating like `?stars=banana` becomes `undefined` silently.
- `replace: false` on every update → each filter change creates a browser history entry → Back/Forward works.
- `hasActiveFilters = Boolean(filters.q || filters.stars)` — used by TotalsLabel to say "matching" vs "total".

---

### `src/hooks/use-reviews.ts`
Wraps `useInfiniteQuery`. Key points:

- `queryKey` includes `q`, `stars`, `sort` (not `lang` — lang is client-side)
- Any key change resets to page 1 automatically (TanStack Query behavior)
- `keepPreviousData` shows old results while new filter results load
- `staleTime: 60_000` — going back to a previous filter within 60s uses cache (instant)
- Returns stable refs: `loadMore`, `retry` — can be passed directly as props

---

### `src/hooks/use-review-stats.ts`
Makes 5 parallel API calls on mount to get star distribution across all reviews.

```ts
// 5 calls fired simultaneously:
fetchReviews({ stars: "1", count: 1, page: 1 }) → { total: 28441 }
fetchReviews({ stars: "2", count: 1, page: 1 }) → { total: 14220 }
fetchReviews({ stars: "3", count: 1, page: 1 }) → { total: 23185 }
fetchReviews({ stars: "4", count: 1, page: 1 }) → { total: 54329 }
fetchReviews({ stars: "5", count: 1, page: 1 }) → { total: 226253 }
```

Only `count: 1` is requested — we only need the `total` field, not actual reviews. This minimises payload. Cached for 5 minutes with `staleTime`.

---

### `src/lib/date-groups.ts`
A **pure function** with no side effects. Takes `Review[]` → returns `DateGroup[]`.

Date buckets per spec:
1. **Today** — same calendar date as now
2. **Yesterday** — one day before today
3. **This Week** — Monday of current week up to (not including) yesterday
4. **Last Week** — previous Monday through previous Sunday
5. **This Month** — 1st of current month through the Monday before last week
6. **Last Month** — 1st of previous month through last day of previous month
7. **Mar 2025**, **Feb 2025**, ... — dynamic month labels going back to the oldest review

Empty buckets are omitted. Month depth is derived from the oldest review date so nothing ever falls off.

---

### `src/hooks/use-theme.ts`
Custom theme system (not next-themes, not shadcn's useTheme).

- Persists to `localStorage`
- Applies by toggling the `dark` class on `<html>` (Tailwind's dark mode mechanism)
- Listens to `prefers-color-scheme` media query when set to "system"
- Exports `useTheme()` hook that throws if used outside `ThemeProvider`

---

### `src/components/reviews/ReviewsPage.tsx`
The page-level orchestrator. It:
1. Gets filter state from `useReviewFilters`
2. Fetches reviews with `useReviews`
3. Fetches stats with `useReviewStats`
4. Applies client-side language filter with `useMemo`
5. Groups by date with `useMemo`
6. Renders: `InsightsBar → SearchFilters → refetch indicator → TotalsLabel → ReviewList | Skeleton | Error → LoadMoreButton`

Nothing smart happens here — it just connects hooks to components.

---

### `src/components/reviews/InsightsBar.tsx`
Receives `ReviewStats` (from hook) and `reviews` (loaded reviews for language analysis).

**Stat tiles:** Total Reviews, Avg Rating, Satisfaction (4★+5★), Critical (1★)

**Distribution chart:** Horizontal bar for each star rating. Bar widths animate from 0% → real % via CSS `transition-all duration-700`. Color-coded: green (5★) → amber (3★) → red (1★).

**Top Languages:** Computed from the loaded `reviews` array using `predicted_langs[0]` (the highest-confidence detected language). Shows top 5 with flag, name, and percentage bar. Updates as more pages are loaded.

---

### `src/components/reviews/SearchFilters.tsx`
Three controls:
1. **Search input** — 400ms debounced, controlled, with clear button
2. **Language dropdown** — `DropdownMenu` with radio items. Shows flag + language name.
3. **Rating pills** — inline `<button>` elements with `aria-pressed` for accessibility

**Why DropdownMenu instead of Select for the language picker?**
The shadcn `Select` component has `data-[size=default]:h-8` hardcoded in its trigger — you cannot override the height to `h-11` with a utility class because the data-attribute selector wins. `DropdownMenu` gives a fully custom trigger with no height constraints.

---

### `src/components/reviews/ReviewModal.tsx`
Opens when a `ReviewCard` is clicked. Wraps `@base-ui/react/dialog`.

Contains:
- `BigStars` — 5-star row with accessible `aria-label`
- Color-coded rating badge (green for 5, red for 1)
- Metadata row: author · country flag · version · time-ago · language flag
- Scrollable body with `whitespace-pre-wrap`
- "Original" accordion — shows pre-translation text if the review was translated
- `CopyButton` — copies `title + body` to clipboard (with `.catch()` for non-HTTPS)
- "View on Appfigures" deep link using `vendor_id`

---

### `src/components/reviews/Hero.tsx`
The top banner. Uses a canvas-based `DotField` animation.

**How the DotField reads the primary CSS color:**
```ts
// Hero.tsx reads --primary from the computed stylesheet at runtime:
const primaryRaw = useCSSVar("--primary");
// e.g. "oklch(0.648 0.241 33)"

// Strips "oklch(" and ")" → bare channels "0.648 0.241 33"
const ch = oklchChannels(primaryRaw);

// Builds gradient colors with alpha:
gradientFrom: `oklch(${ch} / 0.55)`
gradientTo:   `oklch(${ch} / 0.28)`
```

A `MutationObserver` watches the `class` attribute on `<html>`. When the theme toggles (adding/removing the `dark` class), it re-reads the CSS variable — so the dot colors update instantly without a page reload.

---

### `src/index.css`
Two-layer color system:

**Layer 1 — Raw color scales** (defined in `:root`):
```css
--indigo-50  … --indigo-950   (hue 33 = flame orange-red, #ff3600)
--slate-50   … --slate-950    (hue 255 = cool blue-grey)
--violet-50  … --violet-600   (hue 290 = accent purple)
--amber-400, --amber-500      (star color)
```

**Layer 2 — Semantic tokens** (also in `:root` for light, `.dark` for dark):
```css
--primary           = --indigo-600 in light / --indigo-400 in dark
--background        = --slate-50   in light / --slate-950  in dark
--foreground        = --slate-900  in light / --slate-50   in dark
--muted-foreground  = --slate-500  in light / --slate-400  in dark
/* etc. */
```

**Why oklch?**
oklch is a perceptually uniform color space. Unlike HSL, stepping from `oklch(0.3 …)` to `oklch(0.7 …)` gives a visually even progression. It also allows hitting exact perceptual contrast ratios. Tailwind v4 and modern browsers support it natively.

---

### `src/app/Providers.tsx`
Nests all top-level providers in the right order:
```
ErrorBoundary          ← catches render crashes, shows recovery UI
  ThemeProvider        ← dark/light/system state
    QueryClientProvider ← TanStack Query cache
      BrowserRouter    ← URL-based state (must wrap useSearchParams)
```

`QueryClient` is created inside `useState` so it's stable across re-renders but a fresh instance on each React tree mount (important for tests).

---

### `src/app/ErrorBoundary.tsx`
React class component (required — function components can't be error boundaries).

Catches any render-time JavaScript error in the tree. Shows a recovery UI with:
- A "Try again" button that resets React state
- A "Reload page" button that does `window.location.reload()`
- The error message

In a production app, `componentDidCatch` would forward to Sentry/Datadog.

---

## 7. Key Design Decisions

### URL state instead of React state
All filter values live in the URL (`?q=...&stars=...`). This means:
- Sharing a URL shares the exact view
- Back/Forward navigation works out of the box
- Refresh preserves the state
- No hydration mismatch

### Zod for URL validation
URL params are strings. Zod coerces and validates them in one step:
```ts
// If ?stars=banana → Zod returns undefined (not "banana") → no crash
const ratingsSchema = z.string().optional().transform(val => {
  const valid = new Set(["1","2","3","4","5"]);
  const parts = val?.split(",").filter(s => valid.has(s)) ?? [];
  return parts.length ? parts.join(",") : undefined;
});
```

### Language filter is client-side
The Appfigures `lang` param translates reviews, it doesn't filter them. To filter by language, we use the `predicted_langs` field — an array of ISO codes ordered by confidence. We take `predicted_langs[0]` as the primary language and filter client-side after the API response arrives.

### Stats use 5 lean API calls
To compute average rating we need the total count per star rating. The API doesn't have an aggregate endpoint. So we make 5 parallel requests with `count: 1` — only the `total` field is used from each. This is more accurate than computing the average from 25 sampled reviews. The 5 calls fire simultaneously via `useQueries` and are cached for 5 minutes.

### `keepPreviousData` for smooth filter transitions
When a filter changes, TanStack Query shows the old results while new ones load. This prevents a flash of empty state on every filter change. We show a small spinner during this window so the user knows a fetch is in progress.

### `replace: false` for back/forward
Every filter change pushes a new history entry. This is what the spec requires. The alternative (`replace: true`) would update the URL in place, breaking the Back button.

---

## 8. Requirement Checklist

| Requirement | ✓ | Implementation |
|---|---|---|
| Search by keyword | ✅ | `SearchFilters` → debounce → URL `?q=` → API `q` param |
| Filter by star rating | ✅ | Rating pills → URL `?stars=` → API `stars` param |
| Filter updates URL immediately | ✅ | `useSearchParams` with `replace: false` |
| Loading state shown | ✅ | `ReviewsSkeleton` on initial load; spinner on refetch |
| Error state with message | ✅ | `ErrorState` + `ErrorBoundary`; typed `ApiError` |
| Totals label | ✅ | `TotalsLabel` — "X total/matching reviews" |
| Date grouping (all 8 buckets) | ✅ | `date-groups.ts` — Today/Yesterday/This Week/Last Week/This Month/Last Month/month labels |
| Stars, title, body, author, date | ✅ | `ReviewCard` + `ReviewModal` |
| 25 per page, Load More appends | ✅ | `useInfiniteQuery`, `REVIEWS_PER_PAGE = 25` |
| Filter change resets to page 1 | ✅ | New `queryKey` resets `useInfiniteQuery` |
| URL initialises filters on load | ✅ | `useReviewFilters` reads from URL on mount |
| Back / Forward works | ✅ | `replace: false` on every `setSearchParams` |
| Invalid params fall back silently | ✅ | Zod schemas validate and drop bad values |
| TypeScript throughout | ✅ | Strict mode, no `any` |

---

## 9. How to Run It

```bash
# Install dependencies
npm install

# Start dev server (Vite, port 5173)
npm run dev

# Type-check
npx tsc --noEmit

# Build for production
npm run build
```

Environment: Node 18+, modern browser (Chrome latest).
No environment variables required — the API URL is baked in.

---

## 10. Likely Interview Questions & Answers

**Q: Why TanStack Query instead of writing fetch + useState yourself?**

A: TanStack Query handles the hard parts: deduplication (two components requesting the same data → one request), background refetch, stale-while-revalidate, infinite pagination with page appending, and retry on failure. Writing equivalent behavior from scratch would be 200+ lines and would still miss edge cases like race conditions on rapid filter changes. The library is also the right abstraction for interviews because it shows you know which tool to reach for.

---

**Q: How does the URL state work with browser Back?**

A: React Router's `useSearchParams` is backed by the browser's History API. When we call `setSearchParams(next, { replace: false })`, it calls `history.pushState()` internally — creating a history entry. When the user presses Back, the browser pops that entry, the URL changes, `useSearchParams` re-runs, `useReviewFilters` re-derives new filters, and `useReviews` sees a new `queryKey` — triggering a fetch. The full cycle happens in one React render tick.

---

**Q: How does the date grouping work?**

A: `groupReviewsByDate()` in `date-groups.ts` is a pure function — same input always gives same output. It builds an ordered array of "buckets" (Today, Yesterday, This Week…) based on today's date, then iterates every review and assigns it to the first matching bucket. Empty buckets are filtered out before returning. The month depth is calculated dynamically from the oldest review's date, so a review from 2023 will always fall into a "Jan 2023" bucket rather than being dropped.

---

**Q: What happens if the API is down?**

A: Three layers of protection:
1. `fetchReviews()` catches network errors and throws a readable message ("Network error. Please check your connection.")
2. Non-2xx responses throw a typed `ApiError` with the status code. 5xx → "The server is having trouble"; 4xx → "Request failed (404)".
3. `useInfiniteQuery` has `retry: 2` — it retries twice before surfacing the error. The `ErrorState` component then shows the message with a "Try again" button.
4. `ErrorBoundary` at the root catches any render-time crash not covered by the above.

---

**Q: Why is language filtering client-side?**

A: The Appfigures `lang` API parameter doesn't filter — it translates. Passing `lang=en` returns reviews translated into English, not reviews originally written in English. To actually filter by language, we use the `predicted_langs` field on each review (an array of ISO codes ranked by confidence). We take the first element as the primary language and filter client-side. The trade-off is that the totals label reflects the API total (pre-filter) rather than the language-filtered count — something noted in the UI.

---

**Q: How does the insights panel get the average rating?**

A: We make 5 parallel API calls, one per star rating, each requesting only 1 review (`count=1`). We don't use the actual review — only the `total` field in the response, which tells us how many reviews exist at each rating. From that distribution we compute a weighted average: `(5×count₅ + 4×count₄ + 3×count₃ + 2×count₂ + 1×count₁) / grandTotal`. This is more accurate than averaging the stars of the 25 loaded reviews. The 5 calls are cached for 5 minutes.

---

**Q: How does the DotField know what colour to use when the theme changes?**

A: `getComputedStyle(document.documentElement).getPropertyValue("--primary")` reads the current CSS custom property value at runtime. A `MutationObserver` watches the `class` attribute on `<html>`. When you toggle dark mode, Tailwind adds/removes the `dark` class, the observer fires, and the component re-reads `--primary` — which now resolves to the dark-mode value. The new colour is passed as a prop to the Canvas, which re-draws. No page reload, no flicker.

---

**Q: How does the theme toggle work without a flash on load?**

A: `ThemeProvider` reads from `localStorage` synchronously in the `useState` initialiser (not in `useEffect`). This means the correct theme is known before the first render, so the `dark` class is applied immediately. If it were in `useEffect`, there would be one frame in light mode before switching to dark.

---

*Built for the Appfigures React Development Challenge.*
