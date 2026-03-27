import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Order Management | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Order management", "built for wholesale."],
    subline: "Every order, every account, one dashboard.",
  });
}
