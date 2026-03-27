import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Pricing Tiers for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Per-account pricing tiers.", "Every client sees their price."],
    subline: "Volume discounts, custom rates, category rules — automatic.",
  });
}
