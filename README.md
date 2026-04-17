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
| **Routing** | React Router v7 | URL state sync, browser history support |
| **Fonts** | Geist Variable | Modern, variable-weight sans-serif by Vercel — crisp at every size |

## Architecture

```
src/
├── api/              # API client layer
│   └── reviews.ts    # Fetch wrapper with typed responses and error handling
├── components/
│   ├── layout/       # App shell (Header, theme toggle)
│   ├── reviews/      # Feature components (SearchFilters, ReviewCard, ReviewList, etc.)
│   └── ui/           # shadcn/ui primitives (Button, Input, Select, Skeleton, etc.)
├── hooks/
│   ├── use-reviews.ts        # Data fetching with pagination, abort control, error states
│   ├── use-review-filters.ts # URL ↔ filter state sync via search params
│   └── use-theme.ts          # Light/dark/system theme management
├── lib/
│   ├── date-groups.ts  # Date bucketing logic for review sections
│   └── utils.ts        # cn() utility for class merging
├── types/
│   └── review.ts       # Shared TypeScript interfaces
├── App.tsx             # Root with BrowserRouter
└── main.tsx            # Entry point
```

### Key Design Decisions

**1. Separation of concerns via custom hooks**

All stateful logic lives in hooks (`useReviews`, `useReviewFilters`, `useTheme`), keeping components purely presentational. This makes each piece independently testable and swappable.

**2. URL-driven state**

Filters are the single source of truth via `URLSearchParams`. The `useReviewFilters` hook reads/writes search params, which means:
- Filters survive page refresh
- Browser back/forward works naturally
- Views are shareable via URL
- Invalid params fall back to defaults silently

**3. Debounced search input**

The search input debounces user keystrokes (400ms) before updating the URL and triggering a fetch. This avoids hammering the API on every keystroke while keeping the UI responsive. The local input state updates immediately for a snappy feel.

**4. Request cancellation with AbortController**

When filters change, any in-flight request is cancelled before starting a new one. This prevents race conditions where a slow earlier request could overwrite results from a newer filter change.

**5. Date grouping as a pure utility**

`groupReviewsByDate()` is a pure function that takes an array of reviews and returns labeled groups. The bucketing logic (Today, Yesterday, This Week, Last Week, This Month, then monthly intervals) is computed from the current date and applied without mutation.

**6. Append-based pagination**

"Load More" appends to the existing review list rather than replacing it. Groups are recomputed from the full accumulated array, so reviews naturally slot into the correct date sections as more pages load.

**7. Tailwind CSS v4 with oklch color system**

The theme uses oklch colors for perceptually uniform lightness across the palette. Light and dark themes are controlled via a `.dark` class on `<html>`, toggled by the theme hook which respects system preference and persists to localStorage.

**8. Error boundary pattern**

Every expected failure path is handled: network errors surface a retry button, aborted requests are silently ignored, and invalid URL params fall back to defaults. The API client throws typed `ApiError` instances for HTTP failures.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Browser Support

Targets modern browsers (latest Chrome, Firefox, Safari, Edge). Uses native CSS nesting, oklch colors, and `dvh` units.
