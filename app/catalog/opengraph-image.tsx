import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Catalog | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Product Catalog",
    headline: ["Browse the full", "wholesale catalog."],
    subline: "Specialty foods, seasonal items, and premium ingredients.",
  });
}
