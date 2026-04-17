<div align="center">

<br />

<img src="https://img.shields.io/badge/✦-ItayReview-7c3aed?style=for-the-badge&labelColor=0f0f0f" alt="ItayReview" />

<br /><br />

# ItayReview

### *Where reviews meet insight ✦*

A beautifully crafted explorer for **345,000+** ChatGPT iOS App Store reviews.  
Search, filter by language & rating, and surface real user insights — fast.

<br />

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)

<br />

</div>

---

## ✦ Overview

ItayReview is a fast, modern web app for exploring App Store reviews of the ChatGPT iOS app. Whether you're doing competitive research, tracking sentiment, or just curious what users are saying — every review is one search away.

Built with a focus on **performance**, **polish**, and **developer craft**.

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 🔍 | **Smart Search** | Debounced full-text search with instant clear |
| 🌍 | **Language Filter** | 17 languages with flag + name — custom dropdown matching the search input height exactly |
| ⭐ | **Star Rating Pills** | One-click 1–5 star filters with active highlight states |
| 📅 | **Date Grouping** | Reviews bucketed into Today / This Week / Last Month / … |
| ♾️ | **Infinite Pagination** | Load More with live "showing X of Y" count |
| 🌑 | **Dark / Light / System** | Theme driven entirely by CSS custom properties — zero flicker |
| 💫 | **Interactive Hero** | Cursor-reactive dot-field animation that responds in real time |
| 🦴 | **Skeleton Loaders** | Every loading state has a pixel-matched placeholder |
| ⚠️ | **Graceful Errors** | Error boundaries, retry buttons, and silent fallbacks for invalid URL params |

---

## 🛠️ Tech Stack

```
React 19            UI framework with modern hooks API
TypeScript          End-to-end type safety
Vite 8              Sub-second HMR, native ESM bundling
Tailwind CSS v4     CSS-native engine — no config file needed
Base UI (MUI)       Headless, accessible primitives (Menu, Select, …)
TanStack Query      Infinite pagination, caching, automatic abort
React Router v7     URL-driven filter state — filters survive refresh
Framer Motion       Smooth animations
Plus Jakarta Sans   Variable-weight geometric sans-serif
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/itay1313/appfi.git
cd appfi

# Install
npm install

# Develop
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — you're live.

```bash
npm run build      # Type-check + production build
npm run preview    # Preview the production build
npm run lint       # ESLint
```

---

## 📁 Project Structure

```
src/
├── app/                     Providers, ErrorBoundary
├── components/
│   ├── layout/              Header · Footer · BackgroundCanvas
│   ├── reviews/             Hero · SearchFilters · ReviewCard · ReviewList · …
│   └── ui/                  Design-system primitives (Button, Input, Dropdown, …)
├── hooks/
│   ├── use-reviews.ts       TanStack infinite query + pagination
│   ├── use-review-filters.ts URL ↔ filter state via URLSearchParams
│   └── use-theme.ts         Light / dark / system theme context
└── lib/
    ├── date-groups.ts       Pure date bucketing logic
    ├── languages.ts         ISO 639-1 helpers + flag emojis
    └── utils.ts             cn() class merger
```

---

## 🎨 Design Decisions

**URL-driven state** — filters live in `URLSearchParams`. Every filter change is shareable, survives refresh, and works with browser back/forward.

**Custom language dropdown** — the shadcn `Select` hardcodes `data-[size=default]:h-8` via data-attribute styles that override className. Replaced with a headless `DropdownMenu` trigger for a pixel-perfect `h-11` match with the search input.

**Debounced search** — 400ms debounce fires the URL update and API call while the local input state updates immediately, keeping the UI snappy.

**Append-based pagination** — "Load More" accumulates reviews and date groups are recomputed from the full array, so new reviews slot into the correct sections automatically.

**oklch color system** — the theme palette uses perceptually uniform lightness so accent colours look equally vibrant in light and dark modes without manual tweaking.

---

## 🌐 Browser Support

Targets modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest).  
Uses native CSS nesting, `oklch()`, `dvh` units, and `backdrop-filter`.

---

## 👤 Author

Built with ♥ by **[itaycode.com](https://itaycode.com)**

---

<div align="center">

*✦ ItayReview — Where reviews meet insight*

</div>
