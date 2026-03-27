import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Apply for Wholesale Access | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Become a Partner",
    headline: ["Apply for", "wholesale access."],
    subline: "Restaurants, hotels, catering, and qualified food service operators.",
  });
}
