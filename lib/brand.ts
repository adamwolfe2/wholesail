import { portalConfig } from "./portal-config"

export const BRAND_NAME = portalConfig.brandName
export const BRAND_TEAM = `${BRAND_NAME} Team`
export const BRAND_FLEET = `${BRAND_NAME} Fleet`
export const BRAND_EMAIL = portalConfig.fromEmail
export const AI_MODEL = process.env.AI_CONFIG_MODEL || 'claude-haiku-4-5-20251001'
export function getSiteUrl() { return portalConfig.appUrl }
