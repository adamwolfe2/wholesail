# Wholesail — Continuation Plan

## What This Is
Wholesail is a white-label B2B distribution portal template. Two things in one repo:
1. **wholesailhub.com** — Marketing site that sells portal builds to distributors
2. **White-label template** — The actual portal (admin dashboard, client portal, distributor portal, automated build pipeline) that gets forked/deployed for each client

## Stack
Next.js 16, React 19, TypeScript strict, Prisma + Neon (HTTP adapter), Clerk auth, Stripe payments, Resend email, Anthropic Claude + Google Gemini AI, PostHog analytics, Sentry error tracking, shadcn/ui, Tailwind v4, recharts, @react-pdf/renderer

## Current State (as of 2026-03-26)
- **Live at**: wholesailhub.com
- **Tests**: 930/930 passing (24 test suites)
- **TypeScript**: 0 errors
- **Build**: Clean on Vercel with env vars
- **160 pages, 192 API routes, 25+ Prisma models**

## What Was Done in the Last Session (16 commits)

### Security & Hardening
- Fixed costPrice leak in order queries and product API
- Added rate limiting to 6 unprotected public endpoints (3 new Upstash limiters)
- Fixed Stripe webhook idempotency race condition on quote payment
- Fixed standing orders null product crash in SMS notification
- Added Sentry captureWithContext to 12+ API routes
- Added req.json() error handling to 7 routes
- Added Zod validation to admin/leads route
- Added 3 database indexes (QuoteItem.productId, StandingOrder.userId, Organization.email)
- Added onDelete: SetNull on OrderItem/QuoteItem → Product (preserves historical records)
- Added AbortControllers to 5 client-side useEffect fetches
- Added 10s timeouts to all external API calls (Cursive, Slack, Bloo.io)
- Fixed Clerk webhook user deletion cascade

### Performance & Config
- Migrated 6,200 hardcoded hex colors → 15 semantic design tokens (enables white-labeling)
- Added image formats: AVIF/WebP
- Added immutable cache headers on static assets
- Added X-DNS-Prefetch-Control
- Expanded optimizePackageImports (lucide-react, recharts, date-fns, @radix-ui/react-icons)
- Installed @vercel/analytics + @vercel/speed-insights
- Added NEXT_PUBLIC_APP_URL to env validation
- Deleted unused styles/globals.css

### Architecture
- Created lib/portal-config.ts — centralizes 17 per-client env vars into one typed config (35 files migrated)
- Replaced setTimeout webhook retry with database-backed retry queue + cron (every 5 min)
- Wired shouldSendEmail() preference checks into marketing email paths

### Component Splits (every giant file broken up)
- demo-portal.tsx (2,713 lines → 22 files in components/demo-portal/)
- Marketing homepage (1,797 lines → 20 files in components/homepage/)
- lib/email/index.ts (2,362 lines → 8 domain files in lib/email/)
- intake-wizard.tsx (1,386 lines → 9 files in components/intake/)

### Features
- Fulfillment board demo view (Kanban: New/Picking/Packed/Shipped)
- Standing orders demo view (3 recurring orders, monthly revenue)
- Pricing rules demo view (volume breaks, customer discounts, seasonal promos)
- Leads/CRM demo view (Kanban pipeline, 8 leads, activity feed)
- Lead capture toast in demo (triggers after 60s or 3+ nav clicks)
- Strengthened demo banner CTA + urgency messaging
- Client portal mobile polish (catalog cards, sticky cart bar, mobile order cards, reorder button)
- Email template unification (all 25+ emails use shared buildBaseHtml)
- Admin analytics: top products + client health components with unstable_cache
- Onboarding drip enhanced (4-step: welcome, catalog, standing orders, analytics)
- Intake form error handling (visible error banner on API failure)

### Mobile Optimization
- 25+ grid layouts fixed for 375px/390px iPhone viewports
- All grids now stack single-column on mobile, expand at sm: breakpoint
- Demo portal: overflow-x-auto on tables, reduced padding, larger touch targets
- Tour popup: w-full max-w-[420px] instead of fixed w-[420px]

### Testing
- 257 new tests (673 → 930) across 7 new test suites
- Portal config, webhook retry, demo portal structure, homepage structure, email templates, mobile responsive grids, intake wizard structure

### Infrastructure
- 67 error boundaries (100% route coverage) + global-error.tsx
- 62 loading.tsx skeleton files
- Prisma migration for webhook retry fields + optional productId
- 24 page title metadata via layout.tsx files

---

## What's Left — Prioritized Work Items

### TIER 1: Highest Impact (do these first)

#### 1. Test Coverage for Critical Flows (~2-3 hours)
**Why:** 192 API routes, ~5 have tests. The checkout flow, cron jobs, and Stripe/Clerk webhooks are completely untested.
**What to build:**
- `__tests__/checkout-flow.test.ts` — Test the checkout API validates prices server-side, handles missing cart, creates order with items, reserves inventory
- `__tests__/cron-jobs.test.ts` — Test all 10 cron routes exist, export GET, validate CRON_SECRET, have proper error handling
- `__tests__/stripe-webhook.test.ts` — Test event routing, signature validation pattern, idempotency checks
- `__tests__/clerk-webhook.test.ts` — Test user creation/update/deletion handlers, org linking
- `__tests__/api-validation.test.ts` — Scan all POST/PUT/PATCH routes for Zod validation
**Files:** All in `__tests__/`
**Impact:** Prevents regressions on money-handling code

#### 2. Accessibility Pass (~2 hours)
**Why:** Only 9% of 395 TSX files have aria-labels. Forms, modals, and interactive elements need proper ARIA attributes.
**What to build:**
- Add `aria-label` to all icon-only buttons across components/
- Add `role="dialog"` to all modal/sheet components
- Add `aria-live="polite"` to loading states and toast notifications
- Add `htmlFor` attributes to all form labels
- Add `aria-describedby` for form error messages
**Files:** components/ui/*.tsx, components/portal-nav.tsx, all form components
**Impact:** WCAG compliance, screen reader support

#### 3. JSON-LD Structured Data (~1.5 hours)
**Why:** 0% structured data coverage. Google won't show rich results for products, FAQ, or business info.
**What to build:**
- Product schema on catalog/[slug]/page.tsx (already has basic JSON-LD, enhance it)
- FAQPage schema on FAQ section (homepage)
- Organization schema on marketing pages
- BreadcrumbList on all marketing pages
- SoftwareApplication schema on homepage
**Files:** app/(marketing)/, app/catalog/, components/homepage/faq-section.tsx
**Impact:** SEO ranking boost, rich search results

### TIER 2: High Impact

#### 4. README.md (~1 hour)
**Why:** No documentation exists. A new developer (or operator) can't get started.
**What to build:**
- Getting started (clone, install, env setup)
- Architecture overview (app structure, key directories)
- Design system (tokens, fonts, rules)
- Build pipeline overview
- Deployment guide
- Testing guide
**File:** README.md at project root
**Impact:** Developer onboarding, portfolio presentation

#### 5. Split Remaining Large Files (~2 hours)
**Why:** 5 files still exceed 800 lines, violating the style guide.
**What to split:**
- `lib/ai/ai-tools.ts` (1,602 lines) → Split by tool category
- `app/api/admin/intakes/[id]/build-start/route.ts` (975 lines) → Extract provisioning functions into lib/build/
- `app/admin/messages/messages-admin-client.tsx` (971 lines) → Split into message-list, message-thread, message-composer
- `app/admin/ceo/page.tsx` (960 lines) → Extract chart components
- `app/client-portal/analytics/page.tsx` (921 lines) → Extract chart sections
**Impact:** Maintainability, code review efficiency

#### 6. E2E Tests with Playwright (~3 hours)
**Why:** 930 unit/structural tests but zero E2E tests that actually render pages.
**What to build:**
- Marketing homepage loads, scrolls, demo launcher works
- Intake wizard: fill all 4 steps, verify submission
- Demo portal: navigate all 21 views
- Client portal: catalog → add to cart → cart drawer → checkout page
- Admin: login → dashboard → navigate key pages
**Files:** New `e2e/` directory with Playwright config
**Impact:** Catches rendering bugs that unit tests miss

### TIER 3: Medium Impact

#### 7. Open Graph Images for Remaining Pages (~1 hour)
**Why:** 56% OG coverage on public pages. Social sharing shows generic previews for 70 pages.
**What to build:**
- Use existing `app/opengraph-image.tsx` pattern
- Add OG images to industry pages, feature pages, blog posts
- Generate dynamic OG images with next/og (ImageResponse)
**Impact:** Better social sharing previews

#### 8. Performance Profiling (~1 hour)
**Why:** Vercel Speed Insights was just installed but we haven't baselined Core Web Vitals.
**What to do:**
- Run Lighthouse on homepage, catalog, demo, checkout (mobile + desktop)
- Identify any LCP/CLS/INP issues
- Fix the top 3 findings
- Document baseline scores
**Impact:** Data-driven performance optimization

#### 9. Client Onboarding UX (~2 hours)
**Why:** When a brand new client first logs into their portal, what do they see?
**What to build:**
- First-login detection (check if user has 0 orders)
- Welcome banner with 3-step guide: "Browse catalog → Place first order → Set up standing orders"
- Dismissible, stored in user preferences
- Link to the onboarding drip email content
**Files:** app/client-portal/dashboard/page.tsx, new components/onboarding-banner.tsx
**Impact:** Client activation rate, reduces support load

#### 10. TBGC Reference Deployment Prep (~2 hours)
**Why:** TBGC is the first real client. portal.config.ts and design tokens are ready, but the actual fork workflow needs testing.
**What to do:**
- Verify the build pipeline can create a TBGC repo from template
- Test portal.config.ts with TBGC-specific values
- Verify design tokens apply correctly with TBGC brand colors
- Create a TBGC-specific seed data set
- Document the deployment checklist
**Impact:** Proves the product works end-to-end

---

## Design System Rules (MUST FOLLOW)
- NO emojis anywhere — Lucide React icons only
- NO dark mode — light theme only
- NO border-radius (brutalist editorial design)
- Design tokens in @theme block of app/globals.css: ink, cream, sand, shell, ink-dark, cream-hover, brand, gold, sky, error, success, success-light, gold-light, gold-wash
- Fonts: Newsreader (serif, font-serif), Geist Mono (font-mono)
- Self-hosted via next/font (zero external font requests)
- Use portalConfig from lib/portal-config.ts for all per-client values
- Batch commits, push once (cost-conscious on Vercel builds)
- When updating .env.local, also push to Vercel project env vars

## Key File Locations
- `lib/portal-config.ts` — Per-client configuration (17 env vars centralized)
- `app/globals.css` — Design tokens in @theme block
- `prisma/schema.prisma` — 25+ models, comprehensive indexes
- `lib/email/shared.ts` — Shared email template (buildBaseHtml)
- `lib/email/` — 8 domain files for all email types
- `components/demo-portal/` — 26 files, complete interactive demo
- `components/homepage/` — 20 section components
- `components/intake/` — 9 files, intake wizard
- `lib/webhooks.ts` — Outgoing webhook dispatch with DB-backed retry
- `app/api/cron/` — 10 cron routes + webhook-retry
- `__tests__/` — 24 test suites, 930 tests

## Commands
```bash
pnpm install          # Install deps
pnpm dev              # Dev server
pnpm build            # Production build (needs env vars)
pnpm test             # Run all tests
pnpm exec tsc --noEmit  # Type check
ANALYZE=true pnpm build  # Bundle analysis
```
