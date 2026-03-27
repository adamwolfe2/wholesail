import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Distributor Client Portal | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["A branded portal", "for every client."],
    subline: "Orders, invoices, catalog — self-service for your accounts.",
  });
}
