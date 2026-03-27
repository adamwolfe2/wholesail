import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Standing Orders for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Standing orders.", "Set it and forget it."],
    subline: "Recurring weekly orders submitted automatically for your regulars.",
  });
}
