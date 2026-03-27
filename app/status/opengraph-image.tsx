import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "System Status | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "System Status",
    headline: "Platform Status",
    subline: "Real-time uptime and incident reporting for Wholesail.",
  });
}
