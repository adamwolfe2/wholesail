import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "The Journal | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "The Journal",
    headline: ["Behind the scenes", "from Wholesail."],
    subline: "Truffle season guides, caviar sourcing, specialty food insights.",
  });
}
