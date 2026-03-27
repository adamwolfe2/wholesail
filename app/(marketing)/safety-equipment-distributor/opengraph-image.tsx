import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ordering Portal for Safety Equipment Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Safety Equipment",
    headline: ["Ordering portal for", "safety equipment distributors."],
    subline: "Clients order online 24/7. Live in under 2 weeks.",
  });
}
