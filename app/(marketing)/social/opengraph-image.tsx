import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wanna Bump? — Wholesail on Instagram";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "@wholesailhub",
    headline: "Wanna Bump?",
    subline: "Weekly caviar giveaway, partner creations, behind the scenes.",
  });
}
