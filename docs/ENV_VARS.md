# TBGC — Environment Variables

Copy `.env.example` → `.env.local` and fill in the values.
Never commit `.env.local` — it is in `.gitignore`.

---

## Required (app won't work without these)

| Variable | Purpose | Where to get it |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | neon.tech → Project → Connection String (pooled) |
| `DATABASE_URL_UNPOOLED` | Neon direct connection (Prisma migrations) | neon.tech → Project → Connection String (direct) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | clerk.com → API Keys |
| `CLERK_SECRET_KEY` | Clerk server key | clerk.com → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | clerk.com → Webhooks → Endpoint → Signing Secret |
| `STRIPE_SECRET_KEY` | Stripe server key | stripe.com → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | stripe.com → Developers → Webhooks |
| `RESEND_API_KEY` | Transactional email | resend.com → API Keys |

---

## Optional — Features Degrade Gracefully if Not Set

### Email / Notifications

| Variable | Purpose | Default |
|---|---|---|
| `RESEND_FROM_EMAIL` | Sender address (must be verified domain) | `orders@truffleboys.com` |
| `OPS_NOTIFICATION_EMAIL` | Internal ops alert email | Falls back to `RESEND_FROM_EMAIL` |
| `OPS_NAME` | Operator name used in SMS + email copy ("Rocky will confirm…") | `"our team"` |

### SMS / iMessage (Bloo.io)

| Variable | Purpose |
|---|---|
| `BLOOIO_API_KEY` | Bloo.io API key (blooio.com → Settings) |
| `BLOOIO_FROM_NUMBER` | Your Bloo.io phone number (E.164 format: +15551234567) |
| `BLOOIO_WEBHOOK_SECRET` | HMAC-SHA256 signing secret (registered at blooio.com) |
| `OPS_PHONE_NUMBER` | Ops team mobile — receives SMS alert on every SMS order |

### AI Features

| Variable | Purpose | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Required for `/admin/chat` AI assistant. Without it, chat returns 503. | — |
| `AI_CHAT_MODEL` | Override the AI model | `claude-haiku-4-5-20251001` |
| `GEMINI_API_KEY` | Google Gemini for AI order parser (SMS ordering) | Falls back to fuzzy matching |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Alternative name for `GEMINI_API_KEY` | — |

### Company Enrichment

| Variable | Purpose |
|---|---|
| `FIRECRAWL_API_KEY` | Firecrawl for lead/company enrichment (firecrawl.dev) |

### Cold Email Campaigns (Cursive)

| Variable | Purpose |
|---|---|
| `CURSIVE_API_KEY` | Cursive outbound API key |
| `CURSIVE_CAMPAIGN_ID` | Campaign UUID to attach leads |
| `CURSIVE_BASE_URL` | Cursive API base URL (default: `https://send.meetcursive.com`) |

### Rate Limiting (Upstash Redis / Vercel KV)

| Variable | Purpose |
|---|---|
| `KV_REST_API_URL` | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Upstash Redis REST token |

### App URLs

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public base URL for links in emails/SMS | `https://truffleboys.com` |
| `NEXT_PUBLIC_SITE_URL` | Alternate site URL reference | `https://truffleboys.com` |

### Automation

| Variable | Purpose |
|---|---|
| `CRON_SECRET` | Bearer token for Vercel cron jobs (generate: `openssl rand -hex 32`) |
| `TRACKING_API_KEY` | GPS hardware webhook auth (`/api/shipments/[id]/location`) |

### Error Tracking / Analytics (optional)

| Variable | Purpose |
|---|---|
| `SENTRY_DSN` | Sentry error reporting |
| `SENTRY_AUTH_TOKEN` | Sentry source maps upload |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://app.posthog.com`) |

---

## Vercel Production Checklist

Before going live, confirm these are set in Vercel → Settings → Environment Variables:

- [ ] `DATABASE_URL` + `DATABASE_URL_UNPOOLED` (production Neon branch)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (production Clerk app)
- [ ] `CLERK_WEBHOOK_SECRET` (production webhook endpoint registered)
- [ ] `STRIPE_SECRET_KEY` → **swap test key for live key**
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → **swap test key for live key**
- [ ] `STRIPE_WEBHOOK_SECRET` (production webhook registered)
- [ ] `RESEND_API_KEY` (domain verified in Resend)
- [ ] `NEXT_PUBLIC_APP_URL=https://truffleboys.com`
- [ ] `OPS_NAME` (operator first name for customer-facing messages)
- [ ] `ANTHROPIC_API_KEY` (for AI admin assistant)
- [ ] `BLOOIO_API_KEY` + `BLOOIO_FROM_NUMBER` + `BLOOIO_WEBHOOK_SECRET` (for SMS ordering)
- [ ] `CRON_SECRET` (for automated billing reminders)

---

## Webhook Endpoints (register with each service)

| Service | Endpoint | Events |
|---|---|---|
| Clerk | `https://truffleboys.com/api/webhooks/clerk` | `user.created`, `user.updated` |
| Stripe | `https://truffleboys.com/api/webhooks/stripe` | `checkout.session.completed`, `invoice.paid`, `charge.dispute.created`, etc. |
| Bloo.io | `https://truffleboys.com/api/webhooks/blooio` | All inbound messages + delivery status |
