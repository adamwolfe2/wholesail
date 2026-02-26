/**
 * RFM-based client health scoring system.
 * Pure functions — no DB imports. All data is passed in as raw metrics.
 *
 * Score = (Recency × 40) + (Frequency × 40) + (Monetary × 20)
 */

export interface HealthScore {
  score: number
  label: 'Champion' | 'Healthy' | 'At Risk' | 'Dormant'
  colorClass: string   // Tailwind text color
  bgClass: string      // Tailwind background color
  borderClass: string  // Tailwind border color
}

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate an RFM health score for a single client.
 *
 * @param daysSinceLastOrder - Days since most recent non-cancelled order, or null if never ordered
 * @param ordersLast12Months - Count of non-cancelled orders placed in the last 12 months
 * @param avgOrderValue      - Client's average order value (0 if no orders)
 * @param medianAovAllClients - Median AOV across all active clients (used for monetary normalisation)
 */
export function calculateHealthScore(params: {
  daysSinceLastOrder: number | null
  ordersLast12Months: number
  avgOrderValue: number
  medianAovAllClients: number
}): HealthScore {
  const { daysSinceLastOrder, ordersLast12Months, avgOrderValue, medianAovAllClients } = params

  // ── Recency (0–1) ───────────────────────────────────────────────────────
  // 0 days = 1.0, 60 days = 0.5, 120+ days = 0. null (never ordered) = 0.
  const recency =
    daysSinceLastOrder === null
      ? 0
      : clamp(1 - daysSinceLastOrder / 120, 0, 1)

  // ── Frequency (0–1) ─────────────────────────────────────────────────────
  // Target cadence: 4 orders/month = perfect score. Capped at 1.
  const ordersPerMonth = ordersLast12Months / 12
  const frequency = clamp(ordersPerMonth / 4, 0, 1)

  // ── Monetary (0–1) ──────────────────────────────────────────────────────
  // Client AOV vs median AOV. Score = 0 if no data; capped at 2× median → 1.0
  let monetary = 0
  if (medianAovAllClients > 0 && avgOrderValue > 0) {
    monetary = clamp(avgOrderValue / (medianAovAllClients * 2), 0, 1)
  }

  // ── Final score ─────────────────────────────────────────────────────────
  const raw = recency * 40 + frequency * 40 + monetary * 20
  const score = Math.round(raw)

  const label = getHealthLabel(score)
  const { colorClass, bgClass, borderClass } = getHealthColors(label)

  return { score, label, colorClass, bgClass, borderClass }
}

export function getHealthLabel(score: number): HealthScore['label'] {
  if (score >= 80) return 'Champion'
  if (score >= 60) return 'Healthy'
  if (score >= 40) return 'At Risk'
  return 'Dormant'
}

export function getHealthColors(label: HealthScore['label']): {
  colorClass: string
  bgClass: string
  borderClass: string
} {
  switch (label) {
    case 'Champion':
      return {
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
      }
    case 'Healthy':
      return {
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
      }
    case 'At Risk':
      return {
        colorClass: 'text-amber-700',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
      }
    case 'Dormant':
      return {
        colorClass: 'text-red-700',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
      }
  }
}
