import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ingredient Provenance | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Sourcing Standards",
    headline: ["Every ingredient", "we carry has a story."],
    subline: "Truffles, caviar, wagyu — where we source and why it matters.",
  });
}
