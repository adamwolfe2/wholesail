import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Distribution Portal for Colorado Businesses | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Colorado Distributors",
    headline: ["Wholesale distribution portal", "for Colorado businesses."],
    subline: "Branded client portal. Live in under 2 weeks.",
  });
}
