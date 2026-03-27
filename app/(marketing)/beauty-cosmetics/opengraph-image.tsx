import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ordering Portal for Beauty & Cosmetics Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Beauty & Cosmetics",
    headline: ["Ordering portal for", "beauty and cosmetics distributors."],
    subline: "Clients order online 24/7. Live in under 2 weeks.",
  });
}
