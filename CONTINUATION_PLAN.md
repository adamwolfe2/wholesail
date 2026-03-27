# Wholesail — Continuation Plan

## What This Is
Wholesail is a white-label B2B distribution portal template. Two things in one repo:
1. **wholesailhub.com** — Marketing site that sells portal builds to distributors
2. **White-label template** — The actual portal (admin dashboard, client portal, distributor portal, automated build pipeline) that gets forked/deployed for each client

## Stack
Next.js 16, React 19, TypeScript strict, Prisma + Neon (HTTP adapter), Clerk auth, Stripe payments, Resend email, Anthropic Claude + Google Gemini AI, PostHog analytics, Sentry error tracking, shadcn/ui, Tailwind v4, recharts, @react-pdf/renderer

## Current State (as of 2026-03-26, end of session)
- **Live at**: wholesailhub.com
- **Tests**: 1,207/1,207 passing (33 test suites)
- **TypeScript**: 0 errors
- **Build**: Clean on Vercel with env vars
- **160 pages, 192 API routes, 25+ Prisma models
- **19 commits prior session + 4 this session**
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

#### 5. ~~Split Remaining Large Files~~ DONE
ai-tools.ts DONE (1,602 → 40 lines, split into lib/ai/tools/). All 4 remaining files split:
- `build-start/route.ts` (975 → 381 lines) + 5 new files in lib/build/ (generate-config, commit-artifacts, provision-infrastructure, provision-services, provision-env)
- `messages-admin-client.tsx` (971 → 463 lines) + 5 new files (message-list, message-thread, message-composer, new-conversation-dialog, message-utils)
- `ceo/page.tsx` (960 → 504 lines) + 4 new files (kpi-cards, top-clients-table, churn-risk-table, product-velocity-table)
- `client-portal/analytics/page.tsx` (921 → 203 lines) + 8 new files (analytics-types, analytics-kpi-cards, pricing-tier-card, spending-chart, category-breakdown, order-frequency-chart, order-activity-heatmap, top-products)

#### 6. ~~E2E Tests with Playwright~~ DONE
Playwright installed with chromium. 5 test specs (19 tests) in `e2e/`:
- marketing-homepage.spec.ts (6 tests): title, hero, nav, footer, demo launcher, features scroll
- intake-wizard.spec.ts (4 tests): form loads, fields visible, fillable, step headings
- demo-portal.spec.ts (4 tests): loads, banner, sidebar nav, view switching
- client-portal.spec.ts (3 tests): auth redirects, catalog loads, sign-in page
- admin.spec.ts (2 tests): auth redirect, sign-in page

#### THE REMAINING WORK ITEMS (start here next session):

### COMPLETED TIER 2/3 ITEMS:

#### 7. ~~Open Graph Images for Remaining Pages~~ DONE
82 new opengraph-image.tsx files + shared lib/og-image.tsx utility. Coverage: 1 → 83 OG files.
All static public pages covered (marketing, features, 39 industries, 13 states, catalog, partner, claim, status).

#### 8. Performance Profiling
**Why:** Vercel Speed Insights was just installed but we haven't baselined Core Web Vitals.
**What to do:**
- Run Lighthouse on homepage, catalog, demo, checkout (mobile + desktop)
- Identify any LCP/CLS/INP issues
- Fix the top 3 findings
- Document baseline scores
**Impact:** Data-driven performance optimization

#### 9. ~~Client Onboarding UX~~ DONE
New components/onboarding-banner.tsx: dismissible 3-step guide (Browse catalog, Place first order, Set up standing orders).
Integrated into client-portal dashboard. Steps auto-complete based on order count. Dismissed state in localStorage.

#### 10. ~~TBGC Reference Deployment Prep~~ DONE
- scripts/seed-tbgc-products.ts: 20 luxury food products, 3 demo orgs (NEW/REPEAT/VIP), 5 orders, 3 invoices
- docs/deployment-checklist.md: complete fork/deploy runbook with pre/post deployment verification

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
