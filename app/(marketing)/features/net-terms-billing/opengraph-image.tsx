import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Net Terms Billing for Wholesale Distributors | Wholesail";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OGImage() {
  return buildOgImage({
    eyebrow: "Feature",
    headline: ["Net terms billing.", "Collect faster, chase less."],
    subline: "Automated invoices, reminders, and payment tracking.",
  });
}
