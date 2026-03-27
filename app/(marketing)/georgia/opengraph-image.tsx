import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Distribution Portal for Georgia Businesses | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Georgia Distributors",
    headline: ["Wholesale distribution portal", "for Georgia businesses."],
    subline: "Branded client portal. Live in under 2 weeks.",
  });
}
