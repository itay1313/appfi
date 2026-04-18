# ItayReviews — Presentation Guide

> How to walk through this project confidently in a presentation or interview.
> This is your script. Each section tells you **what to say** and **why it matters**.

---

## How to Use This Guide

Read each section as if you're rehearsing a presentation. The **bold sentences** are the key talking points — say them out loud. The code blocks and details back them up if the interviewer asks follow-up questions.

Aim for **10–15 minutes** if presenting freely, or use individual sections to answer specific questions.

---

## Table of Contents

1. [Opening — What You Built](#1-opening--what-you-built)
2. [Live Demo Walkthrough](#2-live-demo-walkthrough)
3. [Architecture — The Big Picture](#3-architecture--the-big-picture)
4. [Tech Choices — What and Why](#4-tech-choices--what-and-why)
5. [The Three Hardest Problems](#5-the-three-hardest-problems)
6. [Performance Story](#6-performance-story)
7. [Accessibility & Quality](#7-accessibility--quality)
8. [Code Walkthrough — Key Files](#8-code-walkthrough--key-files)
9. [Requirement Checklist](#9-requirement-checklist)
10. [Questions You'll Get Asked](#10-questions-youll-get-asked)

---

## 1. Opening — What You Built

> Start here. 30 seconds. Set the stage.

**"I built a production-grade review explorer for the ChatGPT iOS app. It lets you search 346,000 real App Store reviews, filter by rating and language, see analytics like average rating and language breakdown, and share any filtered view via URL."**

Then add the differentiator:

**"I went beyond the spec — I added a real-time analytics panel, a canvas-based interactive animation, Lighthouse-optimized performance with self-hosted fonts, and full WCAG AA accessibility."**

---

## 2. Live Demo Walkthrough

> Open https://appfi-jet.vercel.app and walk through each feature. ~3 minutes.

### Script:

1. **Hero** — "The top section has an interactive dot-field animation built on canvas. It reacts to cursor movement in real-time. Notice the dots respond to my mouse."

2. **Insights panel** — "These stats come from 5 parallel API calls, one per star rating. The animation counts up on mount. The distribution chart and top languages update as more reviews are loaded."

3. **Search** — Type "crash". "Search is debounced at 400ms so we don't fire on every keystroke. Watch the URL — it updates to `?q=crash`. This means you can share this exact search with someone."

4. **Star filter** — Click "1". "Now we're seeing 1-star reviews containing 'crash'. The URL is `?q=crash&stars=1`. Press Back — we go back to just the search."

5. **Language filter** — Select "Japanese". "Language filtering is done client-side because the API's `lang` parameter translates reviews, it doesn't filter them. I use the `predicted_langs` field from the API response."

6. **Load More** — Click it. "This appends the next 25 reviews. The date groups recalculate — new reviews slot into the correct sections automatically."

7. **Review modal** — Click a card. "Full detail view with metadata, copy button, and a link to the original on Appfigures."

8. **Dark mode** — Toggle it. "The entire palette switches instantly — the canvas animation, the stat tiles, everything. No page reload. The theme persists in localStorage."

9. **Scroll to top** — Scroll down. "After scrolling past the hero, a back-to-top button appears in the bottom right."

---

## 3. Architecture — The Big Picture

> Draw this on a whiteboard or explain verbally. ~2 minutes.

**"The architecture follows a unidirectional data flow pattern. The URL is the single source of truth for all filter state."**

```
URL (?q=crash&stars=1)
  ↓
useReviewFilters (reads URL → typed filters via Zod validation)
  ↓
useReviews (TanStack infinite query → API calls with caching)
  ↓
ReviewsPage (orchestrator — connects hooks to components)
  ↓
Components (InsightsBar, SearchFilters, ReviewList, ReviewCard...)
  ↓
User interaction (typing, clicking)
  ↓
setSearchParams → URL updates → cycle repeats
```

**Key point to emphasize:** "Every filter change pushes a browser history entry. So Back/Forward navigation works out of the box. Refreshing the page restores the exact view. And sharing a URL shares the exact filtered state."

### Folder structure (mention, don't dwell):

```
src/
├── api/          One file. One fetch function. Typed errors.
├── app/          Providers + ErrorBoundary
├── components/
│   ├── layout/   Header, Footer, BackgroundCanvas
│   ├── reviews/  All feature components (14 files)
│   └── ui/       Design system primitives (10 files)
├── hooks/        4 custom hooks (reviews, filters, stats, theme)
├── lib/          Pure utility functions (dates, languages, ratings)
└── types/        Shared TypeScript types
```

**"Every layer has a single responsibility. The API layer doesn't know about React. The hooks don't know about UI. The components just render what they're told."**

---

## 4. Tech Choices — What and Why

> Only explain choices that have a "why". Don't list tools without justification. ~2 minutes.

### TanStack Query (not useEffect + fetch)

**"I could have written fetch + useState + useEffect, but that would be 200+ lines and would miss edge cases like race conditions, deduplication, and retry logic. TanStack Query gives me infinite pagination, keepPreviousData for smooth filter transitions, and automatic abort on unmount — in about 10 lines."**

### URL State via React Router (not useState)

**"Filter state lives in the URL, not in React state. This gives three things for free: shareable URLs, Back/Forward navigation, and state that survives page refresh. React Router's `useSearchParams` is backed by the History API."**

### Zod for URL Validation

**"The spec says invalid URL params should fall back to defaults silently. Zod does this in one `.parse()` call. If someone navigates to `?stars=banana`, Zod returns `undefined` — no crash, no error, just the default view."**

### Base UI (not raw shadcn/Radix)

**"I started with shadcn's Select component but hit a specificity problem — its trigger has a hardcoded height via a data-attribute selector that overrides className. I switched to Base UI's headless primitives which ship zero styles. Every pixel is mine to control."**

If asked about Tailwind v4 or oklch:

**"The color system uses oklch — a perceptually uniform color space. Unlike HSL, equal lightness steps produce visually equal brightness. This means accent colors look equally vibrant in light and dark modes without manual per-theme tweaking."**

---

## 5. The Three Hardest Problems

> Pick 2–3 of these to tell as stories. Interviewers love hearing about problems you solved. ~3 minutes.

### Problem 1: Language filtering doesn't work how you'd expect

**"The Appfigures API has a `lang` parameter, but it doesn't filter — it translates. Sending `lang=en` returns all reviews translated into English, not reviews originally in English."**

**"I solved this client-side using the `predicted_langs` field on each review — an ML-generated array of ISO language codes ranked by confidence. I take the first element as the primary language and filter after the API response arrives."**

**Trade-off to mention:** "The total count still reflects the pre-filter API total, not the language-filtered count. I note this in the UI."

### Problem 2: Getting accurate global stats without an aggregate endpoint

**"I needed the average rating across all 346K reviews, but the API only returns paginated reviews. Computing the average from 25 loaded reviews would be wildly inaccurate."**

**"My solution: fire 5 parallel API calls — one per star rating — each requesting only 1 review. I only use the `total` field from each response. This gives me the exact count at each rating, from which I compute a weighted average. The 5 calls fire simultaneously via `useQueries` and are cached for 5 minutes."**

```ts
// 5 calls, fired simultaneously, ~200 bytes each:
fetchReviews({ stars: "1", count: 1, page: 1 }) → { total: 28441 }
fetchReviews({ stars: "2", count: 1, page: 1 }) → { total: 14220 }
fetchReviews({ stars: "3", count: 1, page: 1 }) → { total: 23185 }
fetchReviews({ stars: "4", count: 1, page: 1 }) → { total: 54329 }
fetchReviews({ stars: "5", count: 1, page: 1 }) → { total: 226253 }
```

### Problem 3: keepPreviousData for smooth filter transitions

**"When the user types a search query, the old results disappear and skeletons flash — terrible UX. TanStack Query's `keepPreviousData` option shows the previous results while new ones load. I overlay a small 'Updating…' pill so the user knows a fetch is in progress."**

**"This means filter changes feel instant — the old results stay on screen until the new ones are ready."**

---

## 6. Performance Story

> Only bring this up if asked, or as a closing "one more thing". ~1-2 minutes.

**"I ran Lighthouse audits and systematically improved the scores."**

Key optimizations (pick 2–3 to mention):

1. **Self-hosted font** — "I replaced the @fontsource-variable package (4 font subsets, 57 KB total) with a single Latin-only woff2 (27 KB), self-hosted from the public directory. Added a `<link rel="preload">` so it downloads in parallel with CSS instead of chaining after it. Used `font-display: optional` to remove fonts from the render-blocking critical path entirely."

2. **Deferred canvas** — "The DotField animation is a heavy canvas operation. I defer its mount using `requestIdleCallback` so it never competes with the initial text paint. The browser paints the hero text first, then starts the animation when idle."

3. **Deferred stats** — "The 5 stats API calls now wait for `requestIdleCallback` before firing. This lets the main reviews query get full network priority on initial load."

4. **Canvas optimizations** — "I cache the canvas gradient instead of recreating it every frame, skip animation frames when the mouse is idle, and reduced dot density by 40%."

---

## 7. Accessibility & Quality

> Mention if asked about quality, a11y, or attention to detail.

**"I audited every component for WCAG AA compliance."**

- All decorative SVGs have `aria-hidden="true"`
- Star ratings use `role="img"` with `aria-label="3 out of 5 stars"`
- External links have `sr-only` text "(opens in a new tab)"
- Color contrast passes AA across both light and dark themes — I removed every Tailwind opacity modifier that reduced contrast below the threshold
- Typography uses Tailwind's semantic scale (no arbitrary pixel sizes like `text-[13.5px]`)
- The `<html>` element has a hardened `lang="en"` with a blocking script + MutationObserver guard

---

## 8. Code Walkthrough — Key Files

> If the interviewer asks to see code, open these files. Know the first line of each.

### `src/api/reviews.ts` — The API layer

**"One file, one fetch function, typed errors. The key decision here is that `lang` is intentionally not sent to the API."**

- `ApiError` class with `.status` for 4xx vs 5xx distinction
- `buildQuery()` converts `ReviewRequest` to URLSearchParams
- `fetchReviews()` handles network errors, non-2xx, and malformed JSON separately
- AbortError is re-thrown (TanStack Query cancels on unmount)

### `src/hooks/use-review-filters.ts` — URL ↔ state bridge

**"This is the single source of truth for all filter state. It reads from the URL, validates with Zod, and writes back."**

- `ratingsSchema` — splits comma-separated stars, validates each, dedupes, sorts
- `langSchema` — validates ISO 639-1 format
- `patch()` — generic updater that sets or deletes a URL param
- `replace: false` — every change pushes a history entry

### `src/hooks/use-reviews.ts` — The data hook

**"This wraps TanStack Query's infinite query. The key things are the queryKey structure and keepPreviousData."**

- `queryKey` includes q, stars, sort (not lang — that's client-side)
- Any key change resets to page 1 automatically
- `placeholderData: keepPreviousData` shows old results during loading
- Returns a clean API: `reviews`, `total`, `loadMore`, `retry`

### `src/lib/date-groups.ts` — Pure date bucketing

**"This is a pure function — same input, same output, no side effects. It builds date buckets and assigns each review to the first matching one."**

Buckets: Today → Yesterday → This Week → Last Week → This Month → Last Month → older months dynamically generated from the oldest review date.

### `src/components/reviews/ReviewsPage.tsx` — The orchestrator

**"This file does nothing clever — it just connects hooks to components. That's intentional. All the logic lives in hooks, all the rendering lives in components."**

1. Gets filters from `useReviewFilters`
2. Fetches reviews with `useReviews`
3. Fetches stats with `useReviewStats`
4. Applies client-side language filter with `useMemo`
5. Groups by date with `useMemo`
6. Renders everything

---

## 9. Requirement Checklist

> Use this as a closing slide or if asked "did you cover everything?"

| Requirement | How |
|---|---|
| Search by keyword | Debounced search → URL `?q=` → API `q` param |
| Filter by star rating | Rating pills → URL `?stars=` → API `stars` param |
| Filter updates URL immediately | `useSearchParams` with `replace: false` |
| Loading state | `ReviewsSkeleton` on initial; floating pill on refetch |
| Error state with message | `ErrorState` + `ErrorBoundary` + typed `ApiError` |
| Totals label | `TotalsLabel` — "X total/matching reviews" |
| Date grouping (8 buckets) | `date-groups.ts` — Today through dynamic month labels |
| Stars, title, body, author, date | `ReviewCard` + `ReviewModal` |
| 25 per page, Load More appends | `useInfiniteQuery`, `REVIEWS_PER_PAGE = 25` |
| Filter change resets to page 1 | New `queryKey` resets `useInfiniteQuery` automatically |
| URL initializes filters on load | `useReviewFilters` reads from URL on mount |
| Back/Forward works | `replace: false` on every `setSearchParams` |
| Invalid params fall back silently | Zod schemas validate and drop bad values |
| TypeScript throughout | Strict mode, no `any` |

**Beyond spec:** Analytics panel, language filter, canvas animation, dark mode, scroll-to-top, self-hosted font, Lighthouse optimization, WCAG AA accessibility.

---

## 10. Questions You'll Get Asked

> Rehearse these. Say the answer out loud before reading it.

---

**Q: Why TanStack Query instead of useEffect + fetch?**

Say: "It handles deduplication, background refetch, infinite pagination, keepPreviousData, retry logic, and automatic abort — all in about 10 lines. Writing it from scratch would be 200+ lines and I'd still miss edge cases like race conditions on rapid filter changes."

---

**Q: How does the URL state work with browser Back?**

Say: "React Router's `useSearchParams` is backed by `history.pushState`. Every filter change pushes a history entry. When the user presses Back, the URL pops, `useSearchParams` re-runs, filters re-derive, and TanStack Query either serves cached data instantly or re-fetches. The whole cycle happens in one React render."

---

**Q: How does date grouping work?**

Say: "`groupReviewsByDate` is a pure function. It builds ordered date buckets — Today, Yesterday, This Week, and so on — then iterates every review and drops it into the first matching bucket. Empty buckets are filtered out. The month depth is calculated dynamically from the oldest review's date, so nothing is ever dropped."

---

**Q: What happens if the API is down?**

Say: "Four layers. First, `fetchReviews` catches network errors and throws a readable message. Second, non-2xx responses throw a typed `ApiError` — 5xx gets a server-trouble message, 4xx gets the status code. Third, TanStack Query retries twice before surfacing the error. Fourth, `ErrorBoundary` at the root catches any render-time crash. The user always sees a recovery UI, never a white screen."

---

**Q: Why is language filtering client-side?**

Say: "The API's `lang` parameter triggers translation, not filtering. Sending `lang=en` returns all reviews *translated into* English, not reviews *written in* English. So I use the `predicted_langs` field — an ML-detected array of language codes — and filter client-side. The trade-off is that total counts reflect the pre-filter API total, which I note in the UI."

---

**Q: How does the insights panel get the average rating?**

Say: "There's no aggregate endpoint. I fire 5 parallel API calls — one per star rating — each requesting only 1 review. I don't use the actual review, only the `total` field. From that distribution I compute a weighted average. This is exact, unlike averaging 25 sampled reviews. The calls are cached for 5 minutes."

---

**Q: How does dark mode work without a flash?**

Say: "Two things. First, a blocking inline script in the `<head>` reads `localStorage` and adds the `dark` class to `<html>` synchronously — before React even mounts. Second, the `ThemeProvider` reads from `localStorage` in the `useState` initializer, not in `useEffect`. This means the correct theme is known before the first render."

---

**Q: What was the hardest part?**

Choose one:

- *"Discovering the language API doesn't filter, it translates. I had to pivot to client-side filtering using predicted_langs."*
- *"Getting smooth filter transitions without skeleton flashing. keepPreviousData plus a subtle loading indicator solved it."*
- *"Optimizing Lighthouse performance — lazy loading the hero actually made it worse because it's above the fold. I learned to defer the animation, not the content."*

---

**Q: What would you improve with more time?**

Say: "Three things. First, server-side rendering for SEO and faster FCP. Second, virtualized scrolling for the review list — right now Load More appends to a growing DOM. Third, end-to-end tests with Playwright to cover the filter → URL → API → render cycle."

---

## Quick Reference — Numbers to Remember

| Metric | Value |
|---|---|
| Total reviews in the dataset | ~346,000 |
| Reviews per page | 25 |
| Search debounce | 400ms |
| Query cache stale time | 60 seconds |
| Stats cache stale time | 5 minutes |
| Stats API calls on mount | 5 (parallel, ~200 bytes each) |
| Font payload | 27 KB (single Latin woff2) |
| Languages supported | 17 |
| Date group buckets | 8 (Today through dynamic months) |

---

*Built by [Itay Haephrati](https://itaycode.com) for the Appfigures React Development Challenge.*
