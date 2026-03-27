import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Ordering Portal for Restaurant Equipment Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Restaurant Equipment",
    headline: ["Ordering portal for", "restaurant equipment distributors."],
    subline: "Clients order online 24/7. Live in under 2 weeks.",
  });
}
