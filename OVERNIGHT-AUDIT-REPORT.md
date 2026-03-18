# Overnight Audit Report

**Date:** 2026-03-18
**Branch:** `overnight-improvements-2026-03-18`
**Total files modified:** 59

## Build & Test Status

| Metric | Before | After |
|--------|--------|-------|
| Build | PASS (clean) | PASS (clean) |
| Tests | 17 files, 662 passing | 17 files, 662 passing |
| Build warnings | 0 errors | 0 errors |

## Changes by Category

### Critical Fixes (P0)

1. **Auth redirect loop fix** — `app/auth/redirect/page.tsx`
   - When `/api/auth/role` returns 401 (no Clerk session), the page now shows an error UI with "Go home" and "Try again" buttons instead of endlessly looping between `/client-portal/dashboard` → `/sign-in` → `/auth/redirect`
   - This was the root cause of the production auth loop issue

2. **Server/client boundary fix** — `app/admin/admin-sidebar.tsx`, `app/admin/layout.tsx`
   - Lucide icon components (functions) were being passed as props from server component to client component, causing "Functions cannot be passed directly to Client Components" crash in production
   - AdminSidebar now imports nav config directly instead of receiving it as a prop

3. **Bootstrap endpoint fix** — `app/api/bootstrap/route.ts`
   - Removed dependency on Clerk `auth()` which failed during redirect loops
   - Now accepts `clerkUserId` + `email` directly, protected by BOOTSTRAP_SECRET
   - Fixed env var with trailing `\n` on Vercel

4. **Unsafe error casts** — `app/api/checkout/route.ts`, `app/api/admin/projects/[id]/tasks/[taskId]/execute/route.ts`
   - Replaced 5 instances of `(err as Error).message` with `err instanceof Error ? err.message : String(err)`
   - Prevents crash if thrown value is not an Error instance

### Code Quality (P1)

5. **Dead code removal** — 3 unused files deleted (294 lines removed)
   - `app/admin/platform-health.tsx` (170 lines)
   - `app/admin/revenue-chart.tsx` (70 lines)
   - `components/tech-marquee.tsx` (54 lines)

6. **Missing error boundary** — `app/admin/projects/error.tsx`
   - Added error.tsx following existing pattern from other admin pages

7. **Missing loading skeleton** — `app/admin/projects/loading.tsx`
   - Added loading.tsx with project card skeletons

### UI/UX & Accessibility (P1)

8. **Page titles** — 30+ pages across admin and client-portal
   - Added `export const metadata: Metadata = { title: "..." }` to all server-rendered pages
   - Combined with layout title templates for proper `<title>` tags
   - Admin: `{Page} | Wholesail Admin`, Client: `{Page} | Wholesail`

9. **Accessibility improvements** — Multiple components
   - Added `aria-label` to icon-only buttons
   - Added `aria-label` to search inputs and unlabeled form fields
   - Added `aria-label` to price/weight/quantity edit inputs in product table

10. **Metadata on authenticated layouts**
    - Admin layout: `robots: { index: false, follow: false }` (prevent indexing)
    - Client-portal layout: same robots directive

### Config & Hardening (P2)

11. **White-label sitemap** — `app/sitemap.ts`
    - `BASE_URL` now reads from `NEXT_PUBLIC_APP_URL` env var instead of hardcoded `wholesailhub.com`

12. **Updated .env.example** — Fixed bootstrap route path from `/api/admin/bootstrap` to `/api/bootstrap`

13. **Improved .gitignore** — Added `.DS_Store`, `*.pem`, `.sentry-*`, `.env.production`

14. **Config formatting** — Fixed indentation in `next.config.mjs` remotePatterns

## Issues Identified But Not Fixed

| Issue | Reason | Recommendation |
|-------|--------|----------------|
| 48 unused shadcn/ui component files | Part of component library scaffolding, may be used in future client deployments | Leave as-is; optionally remove if confirmed unused |
| 29 unused npm dependencies | Many are indirect deps of unused UI components; removing risks breaking future usage | Audit when doing a major dependency update |
| Metadata placement between imports in some files | Sub-agent placed `export const metadata` between import lines instead of after all imports | Low priority — works correctly, just not idiomatic |
| `BRAND_NAME` uses `process.env.BRAND_NAME` in layout but `NEXT_PUBLIC_BRAND_NAME` in client components | Two env vars serve server vs client contexts; could be unified | Consider consolidating to single `NEXT_PUBLIC_BRAND_NAME` |

## Commits on This Branch

```
ffbc621 style: add page titles and accessibility improvements
d3a5eb3 fix: replace unsafe error casts with instanceof checks
4c8e89d chore: config hardening from overnight audit
3c64d31 fix: critical fixes + code quality from overnight audit
```

(Plus 3 earlier commits from pre-audit session fixing bootstrap and sidebar issues)

## Recommended Next Steps

1. **Merge this branch to master** — all changes are safe, build + tests pass
2. **Deploy to production** — the auth redirect loop fix and sidebar fix are critical for wholesailhub.com
3. **Review metadata placement** — some files have metadata export between imports; cosmetic only
4. **Consider dependency audit** — 29 unused deps could be removed to reduce bundle size
5. **Monitor Sentry** — the error cast fixes will prevent silent crashes in checkout and task automation
