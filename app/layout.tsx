import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wholesail — Wholesale Ordering Portals for Distribution Companies",
  description:
    "Wholesail builds custom ordering portals for distribution companies. Your clients order online, you manage everything in one place. Live in under 2 weeks.",
  metadataBase: new URL("https://wholesailhub.com"),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
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
