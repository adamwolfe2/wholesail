import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wholesail — Custom B2B Wholesale Ordering Portals",
  description:
    "Wholesail builds fully custom wholesale ordering portals for distribution companies. Client portal, admin panel, SMS ordering, Stripe billing. Live in under 2 weeks.",
  metadataBase: new URL("https://wholesail.vercel.app"),
  icons: {
    icon: "/og-image.png",
    apple: "/og-image.png",
  },
  openGraph: {
    title: "Wholesail — Custom B2B Wholesale Ordering Portals",
    description:
      "We build fully custom B2B ordering portals for distribution companies. Client portal, admin panel, SMS ordering, Stripe billing. Deployed in under 2 weeks.",
    type: "website",
    siteName: "Wholesail",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wholesail — Your wholesale business, fully automated",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wholesail — Custom B2B Wholesale Ordering Portals",
    description:
      "Custom wholesale ordering portals for distribution companies. 34+ features, live in under 2 weeks.",
    images: ["/og-image.png"],
  },
};

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased font-serif"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-body)" }}
      >
        {children}
      </body>
    </html>
  );

  if (hasClerk) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
