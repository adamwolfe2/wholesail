# Wholesail — Phase 2: Hardening & Optimization Plan

> Phase 1 (completed March 2026): Security fixes, auth hardening, N+1 elimination,
> rate limiting, XSS sanitization, Zod validation, transaction safety, pagination,
> query optimization, dead code removal, TBGC redirect cleanup.

---

## Priority 1 — Performance & Data Integrity (High Impact)

### P1.1 — Batch Sequential Operations
| File | Issue | Fix |
|------|-------|-----|
| `app/api/admin/messages/import-history/route.ts` | Sequential `fetchBlooMessages()` per org — O(n) network latency | Batch with `Promise.allSettled()` (concurrency limit 5) |
| `app/api/admin/drops/[id]/notify/route.ts` | Sequential `sendDropAlertEmail()` per subscriber | Batch with `Promise.allSettled()` (concurrency limit 10) |

### P1.2 — Database Unique Constraints
| Model | Field | Issue |
|-------|-------|-------|
| `Lead` | `email` | Missing `@unique` — bulk-import dedup is app-level only |
| `WholesaleApplication` | `email` | Missing `@unique` — duplicates possible at DB level |

**Migration**: Add `@unique` to both fields, run `prisma migrate dev`, handle P2002 in bulk-import routes.

### P1.3 — React.memo for ProductCard
- `components/product-card.tsx` — renders 100+ times in catalog grid
- Wrap with `React.memo()` to prevent unnecessary re-renders on filter/sort changes
- Also consider `useMemo` for derived values inside the component

---

## Priority 2 — Accessibility (WCAG 2.1 AA)

### P2.1 — FAQ Accordion
- **File**: `components/faq.tsx`
- Add `aria-expanded={isOpen}` and `aria-controls={`faq-answer-${i}`}` to toggle buttons
- Add `id={`faq-answer-${i}`}` and `role="region"` to answer panels

### P2.2 — ToolCard Interactive Element
- **File**: `components/tool-comparison.tsx`
- Replace `<div onClick>` with `<button>` or add `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space)

### P2.3 — Nav Dropdown Keyboard Support
- **File**: `components/nav-bar.tsx`
- Add `aria-expanded`, `aria-haspopup="menu"` to dropdown trigger
- Add `role="menu"` to dropdown panel
- Handle `Escape` key to close, arrow keys for item navigation

---

## Priority 3 — Observability & Error Handling

### P3.1 — Missing Error Logging
| File | Issue |
|------|-------|
| `app/api/admin/bootstrap/route.ts:34` | Returns 500 without `console.error` |
| `app/api/admin/intakes/[id]/route.ts` | Catch block may be missing logging |

### P3.2 — Structured Logging
- Standardize error logging format across all API routes: `[ROUTE_NAME] Error: <message>`
- Consider adding request ID header propagation for tracing

---

## Priority 4 — Architecture & Code Quality

### P4.1 — Env Var Validation at Startup
- Create `lib/env.ts` with Zod schema validating all required env vars
- Import in `instrumentation.ts` (Next.js hook) for fail-fast on missing config
- Prevents silent runtime failures from missing keys

### P4.2 — API Response Consistency
- Standardize error response shape: `{ error: string, code?: string, details?: unknown }`
- Create `lib/api/response.ts` helpers: `apiError(message, status)`, `apiSuccess(data)`
- Reduces boilerplate and ensures consistent client-side error handling

### P4.3 — Database Query Patterns
- Audit remaining `findMany` without `take` limits (potential unbounded queries)
- Ensure all list endpoints have max page size caps
- Consider adding `unstable_cache` to read-heavy admin dashboard queries

---

## Priority 5 — Security Hardening

### P5.1 — CSRF Protection for State-Mutating Routes
- Verify all POST/PUT/DELETE routes check `Origin` or `Referer` headers
- Next.js 16 has built-in protections, but custom API routes may bypass

### P5.2 — Rate Limit Coverage Audit
- Phase 1 added rate limits to 7 AI/external-call routes
- Audit remaining public-facing routes: sign-up, contact form, webhook endpoints
- Ensure Upstash rate limiter is on all unauthenticated mutation endpoints

### P5.3 — Dependency Audit
- Run `pnpm audit` and address any high/critical vulnerabilities
- Review `pnpm outdated` for security-relevant package updates

---

## Priority 6 — Cost Optimization

### P6.1 — AI Call Efficiency
- Audit `lib/ai/` for redundant or oversized prompts
- Ensure `maxTokens` is set appropriately on all AI calls (not using defaults)
- Consider caching AI responses for identical inputs (config generation)

### P6.2 — Database Connection Pooling
- Verify Neon serverless adapter is using connection pooling correctly
- Check for connection leaks in long-running cron jobs

### P6.3 — Image & Asset Optimization
- Verify all images use `next/image` with proper sizing
- Check for unoptimized assets in `public/`

---

## Execution Order

1. **P1.2** — Unique constraints (prevents data corruption, quick win)
2. **P1.1** — Batch operations (biggest performance improvement)
3. **P1.3** — ProductCard memo (client-side perf)
4. **P3.1** — Error logging gaps (quick fix)
5. **P2.1–P2.3** — Accessibility fixes (grouped)
6. **P4.1** — Env validation (prevents deploy failures)
7. **P5.1–P5.3** — Security sweep
8. **P4.2–P4.3** — Code quality patterns
9. **P6.1–P6.3** — Cost optimization

---

## Out of Scope (Phase 3+)
- New features (e.g., analytics dashboard, A/B testing)
- UI redesign or new pages
- Third-party integration additions
- Mobile app or PWA
