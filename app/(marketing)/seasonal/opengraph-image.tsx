import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Seasonal Availability Calendar — Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Seasonal Calendar",
    headline: ["When every luxury", "ingredient is at its finest."],
    subline: "Monthly availability for truffles, caviar, wagyu, and more.",
  });
}
