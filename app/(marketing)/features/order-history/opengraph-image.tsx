import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Order History for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Complete order history", "for every account."],
    subline: "Clients reorder in one click. You see every transaction.",
  });
}
