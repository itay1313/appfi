# ReviewScope — ChatGPT iOS Reviews Explorer

A web application for exploring and filtering user reviews of the ChatGPT iOS app, built as part of the Appfigures React Development Challenge.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React 19 + TypeScript | Type safety, modern hooks API |
| **Build** | Vite | Fast HMR, native ESM, zero-config TS |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first CSS with a composable component library. Tailwind v4 uses the new CSS-native engine — no config file needed |
| **Data fetching** | TanStack Query (React Query) | Declarative server-state management with built-in caching, infinite pagination, request deduplication, and automatic abort signals |
| **Routing** | React Router v7 | URL state sync, browser history support |
| **Validation** | Zod | Runtime validation of URL parameters — invalid values fall back to defaults silently |
| **Fonts** | Plus Jakarta Sans | Bold, geometric variable-weight sans-serif — high readability with personality |

## Architecture

```
src/
├── api/              # API client layer
│   └── reviews.ts    # Fetch wrapper with typed responses and error handling
├── app/
│   ├── Providers.tsx  # Composition root (ThemeProvider, QueryClient, Router)
│   └── ErrorBoundary.tsx
├── components/
│   ├── layout/       # App shell (Header, theme toggle, background)
│   ├── reviews/      # Feature components (SearchFilters, ReviewCard, ReviewList, etc.)
│   └── ui/           # shadcn/ui primitives (Button, Input, Select, Skeleton, etc.)
├── hooks/
│   ├── use-reviews.ts        # TanStack infinite query for paginated data
│   ├── use-review-filters.ts # URL ↔ filter state sync via search params
│   └── use-theme.ts          # Light/dark/system theme context
├── lib/
│   ├── date-groups.ts  # Pure date bucketing logic for review sections
│   ├── languages.ts    # ISO 639-1 helpers for language filtering
│   └── utils.ts        # cn() utility for class merging
├── types/
│   └── review.ts       # Shared TypeScript interfaces
├── App.tsx             # Root with Routes
└── main.tsx            # Entry point
```

### Key Design Decisions

**1. Separation of concerns via custom hooks**

All stateful logic lives in hooks (`useReviews`, `useReviewFilters`, `useTheme`), keeping components purely presentational. This makes each piece independently testable and swappable.

**2. URL-driven state**

Filters are the single source of truth via `URLSearchParams`. The `useReviewFilters` hook reads/writes search params, which means:
- Filters survive page refresh
- Browser back/forward works naturally (each filter change pushes history)
- Views are shareable via URL
- Invalid params are validated with Zod and fall back to defaults silently

**3. Debounced search input**

The search input debounces user keystrokes (400ms) before updating the URL and triggering a fetch. This avoids hammering the API on every keystroke while keeping the UI responsive. The local input state updates immediately for a snappy feel.

**4. TanStack Query for server state**

Reviews are fetched with `useInfiniteQuery`, which provides:
- Automatic request cancellation via `AbortSignal` when filters change (prevents stale responses from overwriting newer results)
- Built-in caching and deduplication — switching back to previous filters is instant
- `keepPreviousData` for smooth UX: the previous results stay visible while new ones load
- Infinite pagination with `getNextPageParam` / `fetchNextPage`

**5. Date grouping as a pure utility**

`groupReviewsByDate()` is a pure function that takes an array of reviews and returns labeled groups. The bucketing logic (Today, Yesterday, This Week, Last Week, This Month, then monthly intervals) is computed from the current date and applied without mutation. Empty groups are omitted.

**6. Append-based pagination**

"Load More" appends to the existing review list rather than replacing it. Groups are recomputed from the full accumulated array, so reviews naturally slot into the correct date sections as more pages load.

**7. Tailwind CSS v4 with oklch color system**

The theme uses oklch colors for perceptually uniform lightness across the palette. Light and dark themes are controlled via a `.dark` class on `<html>`, toggled by the theme context which respects system preference and persists to localStorage.

**8. Layered error handling**

Every expected failure path is handled:
- Network errors surface a retry button via `ErrorState`
- HTTP errors throw typed `ApiError` instances distinguishing 4xx vs 5xx
- Aborted requests (from filter changes mid-flight) are silently ignored by TanStack Query
- Invalid URL params fall back to defaults via Zod schemas
- Render-time crashes are caught by the top-level `ErrorBoundary`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Browser Support

Targets modern browsers (latest Chrome, Firefox, Safari, Edge). Uses native CSS nesting, oklch colors, and `dvh` units.
