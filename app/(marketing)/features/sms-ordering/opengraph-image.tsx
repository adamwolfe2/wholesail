import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "SMS Text Message Ordering for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["SMS ordering.", "Texts become real orders."],
    subline: "Clients keep texting. Orders route to your dashboard automatically.",
  });
}
