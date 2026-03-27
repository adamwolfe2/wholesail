# Wholesail

White-label B2B distribution portal template. Marketing site + automated portal builder for wholesale distributors.

## What This Is

This repo contains two things:

1. **wholesailhub.com** -- Marketing site that sells custom portal builds to distribution companies.
2. **White-label template** -- The actual portal (admin dashboard, client-facing storefront, fulfillment tools, automated build pipeline) that gets forked and deployed per client.

A distributor fills out the intake form, pays via Stripe, and the build pipeline auto-provisions a new portal: GitHub repo, Vercel project, Neon database, Clerk auth, and Stripe account -- all wired together with 28 automated tasks an operator works through before the client goes live.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16 |
| Language | TypeScript (strict) | 5.7 |
| UI | React | 19 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix primitives | 4.2 |
| Database | Prisma ORM + Neon (PostgreSQL, HTTP adapter) | 7.4 |
| Auth | Clerk | 6.38 |
| Payments | Stripe | 20.3 |
| Email | Resend | 6.9 |
| AI | Anthropic Claude SDK + Google Gemini | -- |
| Analytics | PostHog, Vercel Analytics, Vercel Speed Insights | -- |
| Errors | Sentry | 10.40 |
| Rate Limiting | Upstash Redis | -- |
| File Storage | Vercel Blob | -- |
| PDF Generation | @react-pdf/renderer | 4.3 |
| Charts | Recharts | 2.15 |
| Testing | Vitest, Testing Library, jsdom | 4.0 |

## Quick Start

```bash
# 1. Clone
git clone git@github.com:your-org/wholesail.git
cd wholesail

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local

# 4. Fill in required env vars (at minimum):
#    DATABASE_URL          — Neon pooled connection string
#    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    CLERK_SECRET_KEY
#    STRIPE_SECRET_KEY
#    RESEND_API_KEY
#    CRON_SECRET           — openssl rand -hex 32
#    NEXT_PUBLIC_APP_URL   — your domain

# 5. Generate Prisma client
pnpm db:generate

# 6. Run migrations
pnpm db:push

# 7. Start dev server
pnpm dev
```

The dev server runs at `http://localhost:3000` with Turbopack.

## Architecture

```
wholesail/
  app/
    (marketing)/        67 SEO/marketing pages (industry, feature, comparison, blog)
    admin/              Admin dashboard (orders, clients, analytics, fulfillment, CRM)
    client-portal/      Client-facing portal (catalog, cart, orders, invoices, analytics)
    api/                192 API routes (CRUD, webhooks, cron, AI, checkout, build pipeline)
    globals.css         Design tokens (@theme block)
    layout.tsx          Root layout (Clerk, PostHog, fonts, JSON-LD)
  components/
    ui/                 shadcn/ui primitives (buttons, dialogs, tables, etc.)
    demo-portal/        26 files -- interactive demo for the marketing site
    homepage/           20 section components for the marketing homepage
    intake/             9 files -- multi-step intake wizard
  lib/
    portal-config.ts    Per-client configuration (17 env vars, single source of truth)
    email/              8 domain files (onboarding, orders, invoices, reports, etc.)
    ai/                 AI tools and prompt engineering
    webhooks.ts         Outgoing webhook dispatch with DB-backed retry queue
  prisma/
    schema.prisma       43 models, 15 enums, comprehensive indexes
    migrations/         Database migration history
    seed.ts             Seed data for development
  __tests__/            Test suites
  public/               Static assets, favicons, OG images
```

## Design System

Brutalist editorial aesthetic. No border-radius, no emojis, no dark mode.

**Fonts:** Newsreader (serif, body and headlines) and Geist Mono (monospace, data and code). Self-hosted via `next/font` -- zero external font requests.

**Design tokens** defined in the `@theme` block of `app/globals.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| ink | #0A0A0A | Primary text, borders |
| cream | #F9F7F4 | Page backgrounds |
| sand | #C8C0B4 | Muted text, dividers |
| shell | #E5E1DB | Card backgrounds, subtle borders |
| ink-dark | #1A1614 | Hover states on dark elements |
| cream-hover | #F0EDE8 | Hover state for cream backgrounds |
| brand | #2A52BE | Links, primary actions |
| gold | #B8860B | Accent, highlights, badges |
| sky | #4A90D9 | Info states, secondary accent |
| error | #dc2626 | Destructive actions, validation errors |
| success | #059669 | Confirmation, positive states |
| success-light | #16a34a | Lighter success variant |
| gold-light | #FEF3C7 | Gold background tint |
| gold-wash | #FFFBEB | Subtle gold background |

All colors are referenced via Tailwind classes (`bg-ink`, `text-cream`, etc.) or CSS variables. No hardcoded hex values in components.

## Per-Client Configuration

`lib/portal-config.ts` centralizes 17 environment variables into a single typed config object. Every per-client value (brand name, contact email, delivery fees, tax rate, colors, social links) is read from this file rather than scattered `process.env` calls.

This enables white-labeling: fork the repo, set env vars, deploy. The codebase adapts automatically.

Key config fields: `brandName`, `appUrl`, `contactEmail`, `adminEmail`, `primaryColor`, `freeDeliveryThreshold`, `standardDeliveryFee`, `defaultTaxRate`, `fromEmail`, `instagramUrl`.

## Build Pipeline

The automated portal provisioning flow:

1. Distributor fills intake form on wholesailhub.com
2. Submission creates an `IntakeSubmission` record and a `Project` with 28 tasks
3. Stripe checkout processes payment
4. Operator clicks "Start Build" in the admin dashboard
5. Pipeline auto-provisions: GitHub repo (from template), Vercel project, Neon database, Clerk auth app, Stripe account config
6. Operator works through remaining tasks (catalog setup, branding, DNS)
7. Client goes live

## Testing

```bash
pnpm test          # Run all tests (Vitest)
pnpm test:watch    # Watch mode
```

Test suites cover:

| Area | What's Tested |
|------|--------------|
| Checkout flow | Price validation, cart handling, order creation, inventory |
| Stripe webhooks | Event routing, signature validation, idempotency |
| Clerk webhooks | User create/update/delete, org linking |
| Cron jobs | All 10 cron routes exist, export GET, validate CRON_SECRET |
| API validation | POST/PUT/PATCH routes checked for Zod validation |
| API structure | 192 routes export correct HTTP methods |
| Auth boundaries | Admin routes require auth, public routes are open |
| Schema constraints | Required fields, unique constraints, cascade deletes |
| Portal config | 17 env var mappings, fallback defaults |
| Email templates | All 25+ templates render, use shared base HTML |
| Accessibility | ARIA attributes, semantic HTML, form labels |
| Mobile responsive | Grid layouts at 375px/390px breakpoints |
| Demo portal | 26 components render, navigation works |
| Homepage | 20 sections render, structure valid |
| Intake wizard | Multi-step form structure, validation |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build (runs prisma generate + migrate deploy + next build) |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm type-check` | TypeScript type checking (`tsc --noEmit`) |
| `pnpm analyze` | Bundle analysis (`ANALYZE=true next build`) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm db:reset` | Reset database and re-run migrations |

## Environment Variables

Copy `.env.example` to `.env.local`. Full reference:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook signing secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `RESEND_FROM_EMAIL` | Yes | Sender address for transactional emails |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key (AI features) |
| `CRON_SECRET` | Yes | Auth token for cron job endpoints |
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL (no trailing slash) |
| `ADMIN_EMAIL` | Yes | Admin notification recipient |
| `BRAND_NAME` | Yes | Brand name for emails and server-side rendering |
| `NEXT_PUBLIC_BRAND_NAME` | Yes | Brand name for client-side rendering |
| `KV_REST_API_URL` | Recommended | Upstash Redis URL (rate limiting) |
| `KV_REST_API_TOKEN` | Recommended | Upstash Redis token |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Sentry DSN for error tracking |
| `SENTRY_AUTH_TOKEN` | Recommended | Sentry auth token for source maps |
| `GEMINI_API_KEY` | Optional | Google Gemini API key (suggest-reply) |
| `FIRECRAWL_API_KEY` | Optional | Firecrawl key (web scraping in build pipeline) |
| `GITHUB_PAT` | Optional | GitHub PAT for repo provisioning (build pipeline) |
| `GITHUB_OWNER` | Optional | GitHub org for template repos |
| `WS_VERCEL_TOKEN` | Optional | Vercel API token (project provisioning) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | PostHog instance URL |
| `TAVILY_API_KEY` | Optional | Tavily key (industry research) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob storage token |
| `BOOTSTRAP_SECRET` | Optional | One-time admin user bootstrap secret |
| `FREE_DELIVERY_THRESHOLD` | Optional | Free delivery minimum (default: 500) |
| `STANDARD_DELIVERY_FEE` | Optional | Delivery fee (default: 25) |
| `DEFAULT_TAX_RATE` | Optional | Tax rate (default: 0.0875) |
| `BRAND_PRIMARY_COLOR` | Optional | Email header/CTA color (default: #0A0A0A) |
| `BRAND_LOCATION` | Optional | Location shown in email footers |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Public contact email |
| `OPS_NAME` | Optional | Operations team display name |
| `REPORT_RECIPIENTS` | Optional | Comma-separated emails for weekly reports |

See `.env.example` for detailed instructions on where to obtain each value.

## Deployment

Deployed on **Vercel** with the following setup:

1. Connect the GitHub repo to a Vercel project.
2. Set all required environment variables in the Vercel project settings.
3. The build command (`prisma generate && prisma migrate deploy && next build`) runs automatically.
4. Neon database is provisioned separately -- use the pooled connection string.
5. Configure webhook endpoints in Clerk and Stripe pointing to your production domain:
   - Clerk: `https://yourdomain.com/api/webhooks/clerk`
   - Stripe: `https://yourdomain.com/api/webhooks/stripe`
6. Set up Vercel Cron Jobs for the 10 cron routes in `app/api/cron/`.
7. Verify your sending domain in Resend (SPF + DKIM DNS records).

For white-label deployments, fork the repo, update env vars in `lib/portal-config.ts` defaults or Vercel project settings, and deploy.
