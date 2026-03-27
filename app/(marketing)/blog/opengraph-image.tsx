import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Blog — Wholesail | Distribution Operations & Wholesale Ordering";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Wholesail Blog",
    headline: ["Practical guides for", "distribution operators."],
    subline: "Wholesale ordering, billing, operations, and growth.",
  });
}
