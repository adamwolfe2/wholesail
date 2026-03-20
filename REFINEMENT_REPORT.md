# Product Refinement Report
**Date:** 2026-03-19
**Project:** Wholesail (portal-intake)
**Branch:** refinement/2026-03-19

## Product Understanding
Wholesail is a white-label B2B wholesale distribution portal builder. Distributors use it to manage clients, orders, products, invoices, quotes, and shipments. Their clients use a branded portal to browse catalogs, place orders, and manage their accounts. The marketing site sells Wholesail as a SaaS to other distributors.

## Session Summary
- **Pages/Features Audited:** 67 (24 admin, 15 client portal, 8 other app sections, 20 marketing)
- **Issues Found:** 47
- **Issues Fixed:** 38
- **Issues Deferred:** 9

## What Was Fixed

### Critical Functionality (11 files)
- **Silent fetch failures fixed in 11 client portal pages:** dashboard, invoices, quotes, catalog, settings, standing-orders, referrals, payments, analytics, fulfillment, saved-carts now show amber warning banners on data load failure instead of silently showing empty states
- **Action failure toasts:** create/update/delete operations now show toast notifications on failure in settings (notif toggle), standing-orders (CRUD), referrals (generate code), fulfillment (toggle/save), saved-carts (delete/rename)
- **Notification preference toggle revert:** optimistic update now reverts on server failure

### UX Consistency (54 files)
- **Currency formatting standardized:** Created shared `formatCurrency()` utility, replaced 4 different inline patterns across 54 files (admin, client portal, checkout, components, API routes, PDFs)
- **Design system drift fixed:** Replaced `rounded-lg` with `rounded-none` in 12 files, fixed audit-log heading to use `font-serif`, aligned settings page from shadcn semantic tokens to project color system
- **Date formatting:** Replaced bare `.toLocaleDateString()` with `date-fns format()` in projects page
- **Button hover color:** Standardized referral page to use `hover:bg-[#0A0A0A]/80`

### Friction Points Removed (10 files)
- **White-label contamination cleaned:** Replaced TBGC-specific placeholders (Chef Jean-Pierre, truffle, restaurant, culinary) with generic business language in 4 client portal pages
- **Hardcoded brand names:** Checkout and confirmation headers now use `NEXT_PUBLIC_BRAND_NAME`
- **Hardcoded contact email:** Claim page now uses `NEXT_PUBLIC_CONTACT_EMAIL` (5 occurrences)
- **Missing confirmation dialogs:** Added AlertDialog to note delete, webhook delete, and bulk product delete

### Polish & Details (7 files)
- **Removed dead code:** Deleted 3 unused legacy toast files (hooks/use-toast.ts, components/ui/toaster.tsx, components/ui/use-toast.ts) — 417 lines
- **Removed useless exports:** Removed `export const dynamic = 'force-dynamic'` from 4 client components where it had no effect

## Deferred Items (Needs Product Decision)
1. **Forms use manual useState everywhere** — migrating to react-hook-form would be a rewrite, not polish
2. **Hardcoded $50 referral credit** — should be configurable but requires backend change
3. **Hardcoded $25 delivery fee / $500 free threshold** — should use env vars but requires checkout logic change
4. **~25 ad-hoc empty states** use inconsistent text colors — would require touching many small sections
5. **127 API routes** still have console.error without Sentry (from hardening report)
6. **Blog has its own inline nav** separate from shared NavBar component
7. **Suppliers and invoices/aging use h1** while all other pages use h2
8. **Action verbs** (Create/Add/New) not fully standardized — semi-consistent by context
9. **Some client pages export dynamic = 'force-dynamic'** that were not in scope (only removed from 4 key pages)

## Product Recommendations
1. **Strongest area:** Admin dashboard coverage — 24 pages, all with loading/error/empty states, excellent skeleton coverage
2. **Second strongest:** Client portal IDOR protection — every endpoint verifies resource ownership
3. **Weakest area:** Client portal error feedback — was silently swallowing failures (now fixed)
4. **Standardize:** All future currency display should use `formatCurrency()` from `lib/utils.ts`
5. **Standardize:** All future dates should use `date-fns format()`, not `.toLocaleDateString()`
6. **Standardize:** All custom element borders should use `rounded-none` (brutalist design)
7. **Standardize:** All destructive actions should use AlertDialog confirmation
8. **Consider:** Extracting a shared `<FetchErrorBanner />` component from the repeated amber banner pattern
9. **Consider:** Adding `NEXT_PUBLIC_REFERRAL_CREDIT` env var to make referral amount configurable
10. **Preserve:** The white-label env var pattern (`NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`) — extend to remaining hardcoded values

## Patterns Standardized
- **Currency:** `formatCurrency()` from `@/lib/utils` — `$1,234.56` format via Intl
- **Dates:** `format(date, 'MMM d, yyyy')` from date-fns — `Mar 19, 2026`
- **Empty states:** `<EmptyState>` component for full-page, inline text for sub-sections
- **Error feedback:** Amber warning banner for fetch errors, sonner toast for action errors
- **Confirmations:** AlertDialog from shadcn for all destructive actions
- **Border radius:** `rounded-none` on all custom elements (brutalist convention)
- **Headings:** `font-serif text-3xl font-normal` for admin page headings
- **Colors:** `bg-[#F9F7F4]` background, `bg-[#0A0A0A]` primary, `text-[#0A0A0A]/50` muted text
- **Hover:** `hover:bg-[#0A0A0A]/80` for primary button hover
