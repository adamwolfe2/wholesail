# Security Audit Report
**Date:** 2026-03-19
**Project:** Wholesail (portal-intake)
**Auditor:** Claude Code (Automated Adversarial Audit)
**Branch:** security-audit/2026-03-19

## Executive Summary
- **Total Vulnerabilities Found:** 24
  - Critical: 4
  - High: 5
  - Medium: 8
  - Low: 7
- **Total Vulnerabilities Fixed:** 14
- **Remaining (Accepted Risk / Needs Human Decision):** 10

## Attack Surface Summary
- **Total API Endpoints:** ~170 handlers across 156 route files
- **Unprotected Endpoints Found:** 6 -> Fixed: 6
- **Total Frontend Routes:** ~67 marketing + ~20 admin + ~15 client portal
- **Client-Only Protection:** 0 (all server-enforced via Clerk middleware)
- **Database Tables:** 40+
- **Sensitive Fields Identified:** emails, phones, prices, Stripe IDs, internal notes
- **Third-Party Integrations:** 12 (Clerk, Stripe, Sentry, PostHog, Vercel, Neon, Resend, Firecrawl, Anthropic, Cal.com, Bloo.io, Upstash)

---

## Vulnerability Details

### [V-001] /api/status -- Unauthenticated Project Data Leak
- **Severity:** Critical
- **Category:** Data Exposure
- **Location:** app/api/status/route.ts
- **Description:** Accepted any email as query param, returned project details (company, status, domain, Vercel URL, notes, features) without authentication.
- **Exploit Path:** `curl /api/status?email=any@email.com` -> full project details
- **Impact:** Attacker enumerates client projects, discovers infrastructure URLs, reads internal notes
- **Fix Applied:** Require Clerk auth(); strip notes/vercelUrl/enabledFeatures from response
- **Verified:** Yes

### [V-002] Cal.com Webhook Fails Open
- **Severity:** Critical
- **Category:** Auth Bypass
- **Location:** app/api/intake/[id]/cal-booked/route.ts
- **Description:** HMAC signature check was inside `if (secret)` -- unset CAL_WEBHOOK_SECRET disabled all verification
- **Exploit Path:** If env var missing, POST to `/api/intake/[id]/cal-booked` with any payload is accepted
- **Impact:** Attacker marks any intake as "cal booked", disrupting sales pipeline
- **Fix Applied:** Return 503 when secret not configured (fail-secure pattern)
- **Verified:** Yes

### [V-003] Unauthenticated Bootstrap Endpoint
- **Severity:** Critical
- **Category:** Auth Bypass / Privilege Escalation
- **Location:** app/api/bootstrap/route.ts
- **Description:** Accepted clerkUserId+email directly without Clerk session, protected only by BOOTSTRAP_SECRET. If secret leaked/weak, attacker creates admin account.
- **Exploit Path:** POST `/api/bootstrap` with guessed BOOTSTRAP_SECRET -> admin access
- **Impact:** Full admin access to platform
- **Fix Applied:** Replaced with 410 Gone response. Only `/api/admin/bootstrap` (requires Clerk session) remains.
- **Verified:** Yes

### [V-004] /api/claim Loads All Orgs + Leaks Existence
- **Severity:** Critical
- **Category:** Data Exposure / DoS
- **Location:** app/api/claim/route.ts
- **Description:** Fetched up to 5000 orgs into memory for fuzzy matching. Different response codes revealed whether organizations exist.
- **Exploit Path:** POST `/api/claim` with company names -> enumerate all orgs; repeated calls -> memory exhaustion
- **Impact:** Organization enumeration, potential DoS
- **Fix Applied:** Targeted Prisma queries (take: 10) instead of bulk fetch. Unified not_found/already_exists responses.
- **Verified:** Yes

### [V-005] /api/products -- Wholesale Pricing Publicly Accessible
- **Severity:** High
- **Category:** Data Exposure
- **Location:** app/api/products/route.ts
- **Description:** Full product catalog including wholesale prices returned without authentication
- **Exploit Path:** `curl /api/products` -> all prices
- **Impact:** Competitors see wholesale pricing
- **Fix Applied:** Unauthenticated requests get products with price/costPrice stripped
- **Verified:** Yes

### [V-006] Rate Limiting Fails Open in Production
- **Severity:** High
- **Category:** Misconfiguration
- **Location:** lib/rate-limit.ts
- **Description:** `checkRateLimit` returned `{ allowed: true }` when Redis unavailable, including in production
- **Exploit Path:** If Redis goes down, all rate limits disappear -> brute force, spam, DoS
- **Impact:** All rate limiting bypassed during Redis outage
- **Fix Applied:** Fail closed in production (return `{ allowed: false }`), permissive in dev
- **Verified:** Yes

### [V-007] Self-Referral Possible
- **Severity:** High
- **Category:** Business Logic
- **Location:** app/api/client/referrals/route.ts
- **Description:** No check preventing users from referring their own email or org members
- **Exploit Path:** Get referral code -> refer own email -> complete cycle -> earn credits
- **Impact:** Unlimited referral credit farming
- **Fix Applied:** Block referral if email matches current user or any org member
- **Verified:** Yes

### [V-008] Referral Endpoint Missing Rate Limiting
- **Severity:** High
- **Category:** Abuse
- **Location:** app/api/client/referrals/route.ts
- **Description:** POST endpoint triggers outbound emails with no rate limit
- **Exploit Path:** Loop POST requests -> spam unlimited referral emails
- **Impact:** Email bombing, reputation damage to sending domain
- **Fix Applied:** Added 20/min per user rate limit via clientWriteLimiter
- **Verified:** Yes

### [V-009] /api/wholesale/status -- Review Notes Exposed
- **Severity:** High
- **Category:** Data Exposure
- **Location:** app/api/wholesale/status/route.ts
- **Description:** Returned internal reviewNotes for wholesale applications via unauthenticated email lookup
- **Exploit Path:** `curl /api/wholesale/status?email=x` -> internal review comments
- **Impact:** Internal business decisions exposed to applicants
- **Fix Applied:** Removed reviewNotes from response
- **Verified:** Yes

### [V-010] CSP Overly Permissive
- **Severity:** Medium
- **Category:** Misconfiguration
- **Location:** next.config.mjs
- **Description:** script-src allowed `'unsafe-inline' https:` (any HTTPS source). connect-src allowed any HTTPS origin.
- **Impact:** Weakens XSS protection, allows connections to arbitrary third-party hosts
- **Fix Applied:** Replaced blanket `https:` with specific trusted domains for Clerk, Stripe, Sentry, PostHog, Vercel, Cal.com
- **Verified:** Yes

### [V-011] HTML Sanitizer Bypassable
- **Severity:** Medium
- **Category:** XSS
- **Location:** app/(marketing)/blog/[slug]/page.tsx, app/(marketing)/journal/[slug]/page.tsx
- **Description:** Regex-based sanitizer didn't strip svg/object/embed/math/details elements or unquoted event handlers
- **Impact:** XSS if admin-controlled content is ever compromised or CMS-sourced
- **Fix Applied:** Added stripping for dangerous elements and unquoted event handler patterns
- **Verified:** Yes

### [V-012] Weak Environment Validation
- **Severity:** Medium
- **Category:** Misconfiguration
- **Location:** lib/env.ts
- **Description:** Only 5 of ~20 critical env vars validated. Missing: ANTHROPIC_API_KEY, WS_VERCEL_TOKEN, BOOTSTRAP_SECRET, CLERK_WEBHOOK_SECRET, KV_REST_API_URL/TOKEN
- **Impact:** App runs with missing critical vars, causing silent failures
- **Fix Applied:** Added 4 required vars + 2 optional with production warning
- **Verified:** Yes

### [V-013] /api/onboarding -- Internal ID Exposure
- **Severity:** Medium
- **Category:** Data Exposure
- **Location:** app/api/onboarding/route.ts
- **Description:** Returned internal organizationId in public response
- **Impact:** Attacker discovers internal DB identifiers
- **Fix Applied:** Removed organizationId from response
- **Verified:** Yes

### [V-014] Middleware Checks Auth But Not Role
- **Severity:** Medium
- **Category:** Defense-in-Depth Gap
- **Location:** middleware.ts
- **Description:** Admin route middleware only checks userId exists, not role. Each route must call requireAdmin() individually.
- **Impact:** If any admin route forgets requireAdmin(), any authenticated user accesses it
- **Fix Applied:** Not fixed (would require middleware DB access; current per-route pattern is standard)
- **Verified:** N/A -- Accepted risk, documented

---

## Exploitation Scenario Results

### Scenario 1: Unauthorized Data Dump
- **Result:** SUCCEEDED (before fix)
- **Details:** `/api/status?email=X` returned project details for any email. `/api/products` returned full pricing. `/api/wholesale/status?email=X` returned review notes.
- **Remediation:** All three endpoints now require auth or strip sensitive fields

### Scenario 2: Account Takeover
- **Result:** FAILED
- **Details:** Clerk handles auth; no password reset or session manipulation vectors found. JWT tokens are httpOnly via Clerk. No session fixation possible.
- **Remediation:** N/A

### Scenario 3: API Abuse
- **Result:** PARTIALLY SUCCEEDED (before fix)
- **Details:** `/api/claim` loaded 5000 orgs into memory per request. Referral endpoint allowed unlimited email sends. Rate limiting failed open when Redis down.
- **Remediation:** Claim uses targeted queries, referral rate-limited, rate limiting fails closed in production

### Scenario 4: Injection Attacks
- **Result:** FAILED
- **Details:** All 6 `$queryRaw` usages use tagged template literals (parameterized). All routes use Zod validation. No string concatenation in queries. Prisma ORM prevents SQL injection.
- **Remediation:** N/A

### Scenario 5: Insider Threat
- **Result:** FAILED
- **Details:** All client routes enforce org-scoping. IDOR testing on 18 client endpoints passed -- every one verifies resource ownership. Admin routes require ADMIN/OPS role. No privilege escalation path found (after bootstrap fix).
- **Remediation:** Bootstrap endpoint deprecated

---

## IDOR Testing Results (18 endpoints)

| Endpoint | Ownership Check | Result |
|----------|----------------|--------|
| /api/client/orders/[orderNumber] | org scope | PASS |
| /api/client/orders/[orderNumber]/reorder | org scope | PASS |
| /api/client/orders/[orderNumber]/confirm-delivery | org scope | PASS |
| /api/client/quotes/[id] | org scope | PASS |
| /api/client/quotes/[id]/accept | org scope | PASS |
| /api/client/quotes/[id]/decline | org scope | PASS |
| /api/client/quotes/[id]/pay | org scope | PASS |
| /api/client/addresses/[id] | org scope | PASS |
| /api/client/messages/[id] | org scope | PASS |
| /api/client/invoices/[id]/pay | org scope | PASS |
| /api/client/standing-orders/[id] | user scope | PASS |
| /api/client/saved-carts/[id] | user scope | PASS |
| /api/client/conversations/[id]/read | org scope | PASS |
| /api/invoices/[id]/pdf | org scope + admin fallback | PASS |
| /api/shipments/[id] | org scope | PASS |
| /api/distributor/orders/[id]/confirm | distributor scope | PASS |
| /api/distributor/items/[id] | distributor scope | PASS |
| /api/attachments | role-based ownership | PASS |

---

## Dependency Audit
- **pnpm audit results:** 23 total (2 low, 15 moderate, 6 high)
- **Critical/High CVEs:**
  - serialize-javascript RCE (via @sentry/nextjs -> webpack)
  - hono file access (via prisma dev dependency)
  - next HTTP smuggling + CSP bypass (next <16.1.7)
- **Recommended fix:** `pnpm update next@latest @sentry/nextjs@latest prisma@latest`
- **Not fixed in this audit** -- dependency bumps risk breaking changes; recommend separate session

## Security Headers Status
| Header | Status |
|--------|--------|
| HSTS (63072000s, includeSubDomains, preload) | Present |
| CSP | Hardened (specific domains) |
| X-Frame-Options: DENY | Present |
| X-Content-Type-Options: nosniff | Present |
| X-XSS-Protection: 1; mode=block | Present |
| Referrer-Policy: strict-origin-when-cross-origin | Present |
| Permissions-Policy (camera/mic/geo disabled) | Present |
| X-Powered-By | Disabled |
| frame-ancestors: none | Present (via CSP) |

## Positive Security Findings
- No secrets in git history
- No client-side secret leaks (all NEXT_PUBLIC_ vars are genuinely public)
- No CORS misconfigurations (all same-origin)
- All Prisma queries use parameterized templates
- All webhook routes verify signatures (Clerk/Svix, Stripe, Bloo.io)
- All cron routes use fail-secure CRON_SECRET pattern
- All client routes enforce resource ownership (0 IDOR vulnerabilities)
- File upload has MIME allowlist, size limit, and ownership check
- Checkout/billing uses server-side prices, never trusts client input

## Remaining Risks and Recommendations
1. **Bump dependencies** to fix 23 npm audit vulnerabilities (separate session recommended)
2. **Add middleware-level role check** for admin routes as defense-in-depth
3. **Replace regex HTML sanitizer** with DOMPurify if blog content ever becomes user-supplied
4. **Add rate limiting** to remaining client write endpoints (standing-orders, saved-carts, addresses)
5. **Rotate BOOTSTRAP_SECRET** now that the endpoint is deprecated
6. **Consider per-client Anthropic API keys** instead of sharing the parent key to child projects
7. **SSRF protection** has DNS rebinding gap in lib/utils/ssrf-protection.ts (TOCTOU issue)
8. **In-memory rate limiters** on claim routes reset on cold start (Vercel Edge)
9. **Message content** has no max length validation in /api/client/messages/[id]
10. **MIME type validation** on file uploads relies on client-provided Content-Type (spoofable)

## Credentials That May Need Rotation
- `BOOTSTRAP_SECRET` -- endpoint now deprecated, but secret should still be rotated
- No secrets were found committed in git history
- No credentials exposed in client-side code
