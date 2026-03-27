import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Distribution Portal for Illinois Businesses | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Illinois Distributors",
    headline: ["Wholesale distribution portal", "for Illinois businesses."],
    subline: "Branded client portal. Live in under 2 weeks.",
  });
}
