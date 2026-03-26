import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/posthog-provider";
import { Toaster } from "@/components/ui/sonner";
import { Newsreader, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { portalConfig } from "@/lib/portal-config";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F9F7F4",
};

export const metadata: Metadata = {
  title: "Wholesail — Wholesale Ordering Portals for Distribution Companies",
  description:
    "Wholesail builds custom ordering portals for distribution companies. Your clients order online, you manage everything in one place. Live in under 2 weeks.",
  metadataBase: new URL(portalConfig.appUrl),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Wholesail — Wholesale Ordering Portals for Distribution Companies",
    description:
      "Custom ordering portals for distribution companies. Your clients order online. You stop managing orders by phone and spreadsheet. Live in under 2 weeks.",
    type: "website",
    siteName: "Wholesail",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wholesail — Wholesale ordering portals for distribution companies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wholesail — Wholesale Ordering Portals for Distribution Companies",
    description:
      "Custom ordering portals for distribution companies. Your clients order online. Live in under 2 weeks.",
    images: ["/og-image.png"],
  },
};

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: portalConfig.brandName,
  url: portalConfig.appUrl,
  description:
    "Wholesail builds custom wholesale ordering portals for distribution companies. Your clients order online, you manage everything in one place.",
  contactPoint: {
    "@type": "ContactPoint",
    email: portalConfig.contactEmail,
    contactType: "sales",
  },
  sameAs: [portalConfig.instagramUrl],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en" className={`scroll-smooth ${newsreader.variable} ${geistMono.variable}`}>
      <body
        className="antialiased font-serif"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-body)" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
          style={{ backgroundColor: "var(--text-headline)", color: "var(--bg-primary)" }}
        >
          Skip to content
        </a>
        <PostHogProvider>{children}</PostHogProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );

  if (hasClerk) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
