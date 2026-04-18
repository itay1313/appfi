<div align="center">

<br />

<img src="https://img.shields.io/badge/✦_ItayReviews-000?style=for-the-badge&labelColor=ff3600" alt="ItayReviews" />

<br /><br />

# ItayReviews

### Explore 346,000+ ChatGPT iOS reviews — instantly.

Search by keyword, filter by star rating and language, and surface real user insights from the App Store.

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-appfi--jet.vercel.app-000?style=flat-square&logo=vercel&logoColor=white)](https://appfi-jet.vercel.app)

<br />

[![React 19](https://img.shields.io/badge/React-19-58c4dc?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)

</div>

<br />

---

<br />

## Overview

ItayReviews is a production-grade web application for exploring App Store reviews of the ChatGPT iOS app. It connects to the Appfigures API, fetches real review data, and presents it through a fast, polished interface with full-text search, multi-dimensional filtering, and real-time analytics.

Built with a focus on **performance**, **accessibility**, and **developer craft**.

<br />

## Features

### Core

- **Full-text search** — debounced 400ms with instant clear, results update as you type
- **Star rating filter** — one-click pills for 1–5 stars with active state highlighting
- **Language filter** — 17 languages with flag emoji + name, powered by `predicted_langs` detection
- **Date grouping** — reviews bucketed into Today / Yesterday / This Week / Last Month / older months
- **Infinite pagination** — "Load More" appends reviews with live "showing X of Y" counter
- **Review detail modal** — full review body, metadata, original text accordion, copy-to-clipboard, deep link to Appfigures

### Analytics

- **Insights panel** — total reviews, average rating, satisfaction rate (4-5 stars), critical rate (1 star)
- **Rating distribution** — animated horizontal bar chart with color-coded bars (green → red)
- **Top languages** — computed from loaded reviews, updates as more pages are loaded
- **Animated counters** — stat numbers count up on mount using `requestAnimationFrame`

### UX Polish

- **Dark / Light / System theme** — zero-flicker toggle powered by CSS custom properties + blocking `<head>` script
- **Interactive hero** — cursor-reactive canvas dot-field animation with theme-aware colors
- **Skeleton loaders** — pixel-matched placeholders for every loading state
- **Graceful errors** — error boundaries, retry buttons, typed `ApiError` with user-friendly messages
- **URL-driven state** — every filter lives in `URLSearchParams`; shareable, refreshable, Back/Forward works
- **Scroll-to-top** — floating button appears after scrolling past the hero

### Performance

- **Self-hosted font** — single Latin-only woff2 with `font-display: optional` and `<link rel="preload">`
- **Deferred canvas** — DotField mounts via `requestIdleCallback`, never blocks FCP
- **Deferred stats** — 5 parallel API calls wait for idle before firing
- **Content-visibility** — `content-visibility: auto` on below-fold sections
- **CSP font-src** — blocks extension-injected external fonts from polluting the critical path
- **Immutable font caching** — `Cache-Control: public, max-age=31536000, immutable` via Vercel

<br />

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| **UI** | React 19 | Modern hooks API, concurrent features |
| **Language** | TypeScript 6 | End-to-end type safety, strict mode, no `any` |
| **Build** | Vite 8 | Sub-second HMR, native ESM, Rolldown bundler |
| **Styling** | Tailwind CSS v4 | CSS-native engine with `oklch()` color system |
| **Components** | Base UI | Headless accessible primitives — zero style opinions |
| **Data** | TanStack Query v5 | Infinite pagination, caching, `keepPreviousData`, automatic abort |
| **Routing** | React Router v7 | URL-driven filter state via `useSearchParams` |
| **Validation** | Zod | URL param coercion — `?stars=banana` silently becomes `undefined` |
| **Icons** | Lucide React | Tree-shakeable, consistent, accessible |
| **Font** | Plus Jakarta Sans | Variable-weight geometric sans, self-hosted Latin subset |

<br />

## Getting Started

```bash
git clone https://github.com/itay1313/appfi.git
cd appfi
npm install
npm run dev
```

Open **http://localhost:5173** — you're live.

```bash
npm run build      # Type-check + production build
npm run preview    # Preview the production build locally
npm run lint       # ESLint
```

No environment variables needed — the API endpoint is public.

<br />

## Project Structure

```
src/
├── api/
│   └── reviews.ts              API layer: fetchReviews, ApiError, query builder
│
├── app/
│   ├── Providers.tsx           ErrorBoundary → Theme → QueryClient → Router
│   └── ErrorBoundary.tsx       Catches render crashes with recovery UI
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          Logo + theme toggle + external link
│   │   ├── Footer.tsx          Copyright + author attribution
│   │   └── BackgroundCanvas.tsx Subtle animated background texture
│   │
│   ├── reviews/
│   │   ├── ReviewsPage.tsx     Page orchestrator: hooks → components
│   │   ├── Hero.tsx            Banner with DotField canvas animation
│   │   ├── InsightsBar.tsx     Stat tiles + distribution chart + top languages
│   │   ├── SearchFilters.tsx   Search input + language dropdown + rating pills
│   │   ├── ReviewList.tsx      Date-grouped review list with empty state
│   │   ├── ReviewGroup.tsx     Single date-group section
│   │   ├── ReviewCard.tsx      Review summary card (clickable)
│   │   ├── ReviewModal.tsx     Full review detail dialog
│   │   ├── StarRating.tsx      Accessible star display with aria-label
│   │   ├── TotalsLabel.tsx     "X total/matching reviews" counter
│   │   ├── ReviewsSkeleton.tsx Loading placeholder cards
│   │   ├── LoadMoreButton.tsx  Pagination with "showing N of M"
│   │   └── ErrorState.tsx      API error UI with retry
│   │
│   └── ui/
│       ├── DotField.tsx        Canvas dot-grid with cursor-reactive bulge
│       ├── ScrollToTop.tsx     Floating scroll-to-top button
│       ├── button.tsx          CVA-styled button variants
│       ├── input.tsx           Styled input with focus ring
│       ├── dialog.tsx          Base UI Dialog wrapper
│       ├── dropdown-menu.tsx   Base UI Menu wrapper
│       ├── badge.tsx           Status badge component
│       ├── select.tsx          Select dropdown
│       ├── separator.tsx       Visual divider
│       └── skeleton.tsx        Loading placeholder primitive
│
├── hooks/
│   ├── use-reviews.ts          TanStack useInfiniteQuery + pagination
│   ├── use-review-filters.ts   URL ↔ filter state with Zod validation
│   ├── use-review-stats.ts     5 parallel API calls → star distribution
│   ├── use-count-up.ts         Animated number counter hook
│   └── use-theme.ts            Light/dark/system with localStorage
│
├── lib/
│   ├── date-groups.ts          Pure function: reviews[] → DateGroup[]
│   ├── languages.ts            ISO 639-1 → name/flag + country flag helper
│   ├── ratings.ts              Rating color/label utilities
│   └── utils.ts                cn() — clsx + tailwind-merge
│
├── types/
│   └── review.ts               All shared types, constants, interfaces
│
├── App.tsx                     Route setup + layout shell
├── main.tsx                    React 19 createRoot entry
├── fonts.css                   Self-hosted @font-face declaration
└── index.css                   Tailwind v4 + oklch color system
```

<br />

## Architecture Decisions

### URL-driven state

All filter values live in `URLSearchParams` via React Router's `useSearchParams`. Every filter change pushes a history entry (`replace: false`), so:

- Sharing a URL shares the exact filtered view
- Browser Back/Forward navigates filter history
- Page refresh preserves all active filters
- Invalid params (e.g. `?stars=banana`) are silently dropped via Zod

### Client-side language filtering

The Appfigures `lang` API parameter triggers *translation*, not filtering. To filter by language, we use the `predicted_langs` field on each review — an array of ISO language codes ranked by ML confidence. The primary language (`predicted_langs[0]`) is matched client-side after the API response.

### Stats via 5 lean API calls

There's no aggregate endpoint. To compute average rating and distribution, we fire 5 parallel requests (one per star rating) with `count: 1` — only the `total` field from each response is used. This gives exact global counts instead of estimating from a 25-review sample. Cached for 5 minutes via TanStack Query.

### oklch color system

The theme palette uses perceptually uniform `oklch()` colors. Unlike HSL, equal lightness steps produce visually equal brightness. This means accent colors look equally vibrant across light and dark modes without manual per-theme tweaking.

### `keepPreviousData` for smooth transitions

When filters change, TanStack Query shows stale results while fresh data loads. A floating "Updating…" pill appears at the top-right. This avoids the jarring flash of skeleton loaders on every keystroke.

### Performance-first font strategy

Instead of loading Google Fonts or the full `@fontsource-variable` package (4 subsets, 57 KB), we self-host a single Latin woff2 (27 KB) with `font-display: optional`. The font is preloaded in `<head>` so it downloads in parallel with CSS — not chained after it. A CSP `font-src 'self' data:` directive blocks Chrome extensions from injecting external fonts.

<br />

## API Reference

**Endpoint:** `GET https://appfigures.com/_u/careers/api/reviews`

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search across title + body |
| `stars` | string | Comma-separated ratings: `"1"`, `"4,5"` |
| `sort` | string | `-date` (newest), `date` (oldest), `-weight` (most helpful) |
| `count` | number | Reviews per page (default: 25) |
| `page` | number | 1-based page number |

**Response:**

```json
{
  "total": 346428,
  "pages": 13858,
  "this_page": 1,
  "reviews": [
    {
      "id": "...",
      "author": "Username",
      "title": "Review headline",
      "review": "Full review body",
      "stars": "5",
      "date": "2025-04-17T00:00:00",
      "iso": "us",
      "predicted_langs": ["en"],
      "vendor_id": "..."
    }
  ]
}
```

<br />

## Data Flow

```
User types "crash" in search
  → 400ms debounce fires
  → setSearchParams({ q: "crash" })  — pushes history entry
  → useReviewFilters re-derives filters from URL
  → useReviews sees new queryKey → fires fetchReviews({ q: "crash", page: 1 })
  → keepPreviousData shows old results + "Updating…" pill
  → API returns → new reviews replace old → grouped by date → rendered

User clicks Load More
  → fetchNextPage() → fetchReviews({ page: 2, ... })
  → 25 new reviews appended (not replaced)
  → date groups recomputed from full array → new cards appear in correct sections

User presses Back
  → URL pops to previous state
  → useSearchParams re-runs → filters re-derive → cached data shown instantly
```

<br />

## Browser Support

Targets modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest two versions). Uses native CSS nesting, `oklch()`, `dvh` units, `backdrop-filter`, and `content-visibility`.

<br />

## Author

Built by **[Itay Haephrati](https://itaycode.com)**

<br />

---

<div align="center">

**[Live Demo](https://appfi-jet.vercel.app)** · **[Source Code](https://github.com/itay1313/appfi)**

</div>
