import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ordering Portal for Food & Beverage Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Food & Beverage",
    headline: ["Ordering portal for", "food and beverage distributors."],
    subline: "Clients order online 24/7. Live in under 2 weeks.",
  });
}
