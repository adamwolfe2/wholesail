import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Press & Media — Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Press & Media",
    headline: ["Brand assets, press kit,", "and media inquiries."],
    subline: "The wholesale partner behind acclaimed restaurants and hotels.",
  });
}
