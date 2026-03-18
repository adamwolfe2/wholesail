export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Wholesail'
export const BRAND_TEAM = `${BRAND_NAME} Team`
export const BRAND_FLEET = `${BRAND_NAME} Fleet`
export const BRAND_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@wholesailhub.com'
export const AI_MODEL = process.env.AI_CONFIG_MODEL || 'claude-haiku-4-5-20251001'
export function getSiteUrl() { return process.env.NEXT_PUBLIC_APP_URL || 'https://wholesailhub.com' }
