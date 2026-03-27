# Wholesail — Continuation Plan

## What This Is
Wholesail is a white-label B2B distribution portal template. Two things in one repo:
1. **wholesailhub.com** — Marketing site that sells portal builds to distributors
2. **White-label template** — The actual portal (admin dashboard, client portal, distributor portal, automated build pipeline) that gets forked/deployed for each client

## Stack
Next.js 16, React 19, TypeScript strict, Prisma + Neon (HTTP adapter), Clerk auth, Stripe payments, Resend email, Anthropic Claude + Google Gemini AI, PostHog analytics, Sentry error tracking, shadcn/ui, Tailwind v4, recharts, @react-pdf/renderer

## Current State (as of 2026-03-26, end of session)
- **Live at**: wholesailhub.com
- **Tests**: 1,104/1,104 passing (28 test suites)
- **TypeScript**: 0 errors
- **Build**: Clean on Vercel with env vars
- **160 pages, 192 API routes, 25+ Prisma models
- **19 commits this session**
- **README.md**: Complete (265 lines)

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

#### 1. ~~Test Coverage for Critical Flows~~ DONE
174 new tests: checkout-flow (21), stripe-webhook (30), clerk-webhook (21), cron-jobs (102).

#### 2. ~~Accessibility Pass~~ DONE
30+ form fields with htmlFor/id, aria-pressed on toggles, aria-label on icon buttons/search, skip-to-content link, role="status"/"alert" on loading/error states.

#### 3. ~~JSON-LD Structured Data~~ DONE
Organization (root), SoftwareApplication (homepage), BreadcrumbList (homepage, catalog, guide, blog), enhanced Product schema. FAQPage/Article already existed.

#### 4. ~~README.md~~ DONE
265 lines: getting started, architecture, design system, testing, env vars, deployment.

#### 5. Split Remaining Large Files — PARTIALLY DONE
ai-tools.ts DONE (1,602 → 40 lines, split into lib/ai/tools/). Four files still need splitting:

#### THE REMAINING WORK ITEMS (start here next session):

#### A. Split 4 Remaining Large Files (~2 hours)
**What to split:**
- `app/api/admin/intakes/[id]/build-start/route.ts` (975 lines) → Extract provisioning functions into lib/build/provision-*.ts
- `app/admin/messages/messages-admin-client.tsx` (971 lines) → Split into message-list.tsx, message-thread.tsx, message-composer.tsx
- `app/admin/ceo/page.tsx` (960 lines) → Extract chart components into app/admin/ceo/
- `app/client-portal/analytics/page.tsx` (921 lines) → Extract into spending-chart.tsx, order-history.tsx, pricing-tier.tsx
**Impact:** Maintainability, code review efficiency

#### B. E2E Tests with Playwright (~3 hours)
**Why:** 930 unit/structural tests but zero E2E tests that actually render pages.
**What to build:**
- Marketing homepage loads, scrolls, demo launcher works
- Intake wizard: fill all 4 steps, verify submission
- Demo portal: navigate all 21 views
- Client portal: catalog → add to cart → cart drawer → checkout page
- Admin: login → dashboard → navigate key pages
**Files:** New `e2e/` directory with Playwright config
**Impact:** Catches rendering bugs that unit tests miss

### REMAINING TIER 2/3 ITEMS:

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
