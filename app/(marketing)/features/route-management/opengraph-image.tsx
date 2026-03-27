import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Route Management for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Route management", "for delivery operations."],
    subline: "Organize accounts by route, day, and driver.",
  });
}
