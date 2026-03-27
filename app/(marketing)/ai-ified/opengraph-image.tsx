import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "What Is AI-ified? | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "AI-ified Distribution",
    headline: ["Your wholesale business,", "running on autopilot."],
    subline: "Orders, invoices, client management — fully automated.",
  });
}
