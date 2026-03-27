import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "B2B Ordering Portal for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["B2B Ordering Portal", "for wholesale distributors."],
    subline: "Branded login. 24/7 ordering. Live in under 2 weeks.",
  });
}
