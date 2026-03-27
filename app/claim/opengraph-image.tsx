import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Claim Your Portal | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Claim Your Portal",
    headline: ["Your distribution portal", "is ready to claim."],
    subline: "Find your business and activate your wholesale portal.",
  });
}
