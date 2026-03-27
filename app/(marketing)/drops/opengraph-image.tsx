import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Product Drops | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Product Drops",
    headline: ["Limited quantities.", "First come, first served."],
    subline: "Rare seasonal items — truffles, caviar, wagyu, and more.",
  });
}
