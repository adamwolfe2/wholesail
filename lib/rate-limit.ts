import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

function createLimiter(
  redis: Redis | null,
  requests: number,
  window: `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  })
}

const redis = createRedis()

// 10 checkout attempts per IP per 10 minutes
export const checkoutLimiter = createLimiter(redis, 10, '10 m')

// 5 public signups per IP per hour
export const publicSignupLimiter = createLimiter(redis, 5, '1 h')

// 3 drop notify blasts per userId per minute
export const notifyLimiter = createLimiter(redis, 3, '1 m')

// 10 AI calls per userId per hour
export const aiCallLimiter = createLimiter(redis, 10, '1 h')

/** Returns true if the request should be allowed; false if rate-limited. Skips gracefully if limiter is null (env vars not set). */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number }> {
  if (!limiter) {
    return { allowed: true, limit: 0, remaining: 0, reset: 0 }
  }
  const result = await limiter.limit(identifier)
  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/** Extract the best available IP address from a request. */
export function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return '127.0.0.1'
}
