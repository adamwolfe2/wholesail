# Performance Optimization Report
**Date:** 2026-03-20
**Project:** Wholesail (portal-intake)
**Branch:** performance/2026-03-20

## Impact Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Bundle Size (JS) | 6,880 KB | 6,808 KB | -72 KB (-1%) |
| Total Bundle Size (CSS) | 140 KB | 128 KB | -12 KB (-8.5%) |
| Build Output | 185 MB | 184 MB | -1 MB |
| Dependencies Count | 97 | 74 | -23 packages |
| UI Component Files | 53 | 35 | -18 files removed |
| State Page Code | 3,549 lines | 1,066 lines | -2,483 lines (-70%) |
| Marketing Page Initial JS | Full (framer-motion + intake wizard) | Lazy-loaded | Deferred ~500 KB |
| Font Loading | 2 external Google Fonts requests | Self-hosted via next/font | -2 HTTP requests, zero CLS |

## Optimizations Applied

### Bundle Reduction — Dependencies Removed (23 packages)

| Package | Action | Reason |
|---------|--------|--------|
| @radix-ui/react-accordion | Removed | Unused shadcn component |
| @radix-ui/react-aspect-ratio | Removed | Unused shadcn component |
| @radix-ui/react-collapsible | Removed | Unused shadcn component |
| @radix-ui/react-context-menu | Removed | Unused shadcn component |
| @radix-ui/react-hover-card | Removed | Unused shadcn component |
| @radix-ui/react-menubar | Removed | Unused shadcn component |
| @radix-ui/react-navigation-menu | Removed | Unused shadcn component |
| @radix-ui/react-progress | Removed | Unused shadcn component |
| @radix-ui/react-radio-group | Removed | Unused shadcn component |
| @radix-ui/react-slider | Removed | Unused shadcn component |
| @radix-ui/react-toast | Removed | Replaced by Sonner |
| @radix-ui/react-toggle | Removed | Unused shadcn component |
| @radix-ui/react-toggle-group | Removed | Unused shadcn component |
| @react-email/components | Removed | Never imported anywhere |
| @hookform/resolvers | Removed | Never imported anywhere |
| @vercel/analytics | Removed | Vercel auto-injects; explicit dep unused |
| react-hook-form | Removed | Form component never imported |
| next-themes | Removed | No dark mode in project |
| input-otp | Removed | OTP component never imported |
| react-resizable-panels | Removed | Resizable component never imported |
| vaul | Removed | Drawer component never imported |
| embla-carousel-react | Removed | Carousel component never imported |
| react-day-picker | Removed | Calendar component never imported |

**Additionally:** `dotenv` moved from dependencies to devDependencies (only used in seed script).

### UI Component Files Removed (18 files)

accordion, aspect-ratio, calendar, carousel, collapsible, context-menu, drawer, form, hover-card, input-otp, menubar, navigation-menu, progress, radio-group, resizable, slider, toast, toggle, toggle-group

### Code Splitting & Lazy Loading

| Component | Size | Pages Affected | Method |
|-----------|------|----------------|--------|
| BuildDemo (framer-motion) | ~200 KB | Marketing home | `next/dynamic` with `ssr: false` |
| DemoLauncher (framer-motion) | ~200 KB | Marketing home, AI-ified | `next/dynamic` with `ssr: false` |
| IntakeWizard | 1,355 lines | 50+ marketing pages | `next/dynamic` lazy wrapper |

Created thin client-side lazy wrapper components:
- `components/lazy-build-demo.tsx`
- `components/lazy-demo-launcher.tsx`
- `components/lazy-intake-wizard.tsx`

### Font Optimization

- **Before:** 2 external `<link>` tags to Google Fonts (render-blocking, 2 extra HTTP connections)
- **After:** `next/font/google` with `Newsreader` and `Geist_Mono` (self-hosted, zero layout shift, `display: swap`)
- CSS variables updated: `--font-newsreader` and `--font-geist-mono` properly referenced in Tailwind `@theme`

### Code Deduplication — State Page Template

Created `components/state-page-template.tsx` with `StatePage` component and `StateConfig` type.
Converted 13 state pages from ~273 lines each (inline JSX) to ~82 lines each (config + template):

arizona, california, colorado, florida, georgia, illinois, michigan, new-york, north-carolina, ohio, pennsylvania, texas, washington

**Savings:** 2,483 lines of duplicated code eliminated.

### Infrastructure

- Wired `@next/bundle-analyzer` in `next.config.mjs` (run with `pnpm analyze`)
- Added `"analyze"` script to package.json

## Positive Findings (Already Optimized)

- **Route-level code splitting:** Next.js App Router already splits per-page
- **recharts:** Only loaded on 5 admin chart pages (not globally)
- **@react-pdf/renderer:** Server-side only (API routes)
- **@anthropic-ai/sdk:** Server-side only (API routes)
- **Client portal fetch patterns:** Already use parallel fetching (no waterfalls)
- **Product data:** Already cached via `unstable_cache` with 5-minute revalidation
- **Loading skeletons:** 41 admin + 18 client portal `loading.tsx` files
- **Image handling:** Consistent `next/image` usage
- **PostHog:** Conditional initialization, only loads when env var present
- **DemoPortal:** Already lazy-loaded with `next/dynamic`

## Recommendations for Next Session

1. **Virtualize long admin lists** — orders, invoices, clients tables could benefit from `@tanstack/virtual` if datasets grow beyond 100 rows
2. **Add Suspense boundaries to analytics page** — progressive rendering for chart sections
3. **Batch audit log dropdown queries** — 2 sequential `findMany` calls could be combined
4. **Consider removing framer-motion** — only used for `motion` and `AnimatePresence` in 2 components; CSS animations could replace
5. **Product export endpoint** — `prisma.product.findMany()` without pagination could be problematic at scale
