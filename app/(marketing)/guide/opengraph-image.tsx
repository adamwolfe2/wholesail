import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "How to Order — Wholesale Ordering Guide | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Ordering Guide",
    headline: ["Everything you need to know", "about ordering from Wholesail."],
    subline: "Wholesale access, iMessage ordering, standing orders, payment terms.",
  });
}
