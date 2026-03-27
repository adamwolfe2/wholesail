import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Client Health Scoring for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Client health scoring.", "Know who needs attention."],
    subline: "Order frequency, payment behavior, engagement — scored automatically.",
  });
}
