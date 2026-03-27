import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Wholesale Client Onboarding | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Client onboarding", "that runs itself."],
    subline: "Application, approval, account setup — fully automated.",
  });
}
