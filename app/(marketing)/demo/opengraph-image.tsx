import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Live Demo — Wholesail B2B Portal";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Live Demo",
    headline: ["See the portal", "your clients will use."],
    subline: "Interactive demo. No sign-up required.",
  });
}
