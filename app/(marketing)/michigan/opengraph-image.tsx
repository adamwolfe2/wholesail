import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Distribution Portal for Michigan Businesses | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Michigan Distributors",
    headline: ["Wholesale distribution portal", "for Michigan businesses."],
    subline: "Branded client portal. Live in under 2 weeks.",
  });
}
