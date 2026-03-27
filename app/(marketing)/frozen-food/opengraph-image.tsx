import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ordering Portal for Frozen Food Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Frozen Food",
    headline: ["Ordering portal for", "frozen food distributors."],
    subline: "Clients order online 24/7. Live in under 2 weeks.",
  });
}
