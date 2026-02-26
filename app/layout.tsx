import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wholesail — Custom B2B Wholesale Ordering Portals",
  description:
    "Wholesail builds fully custom wholesale ordering portals for distribution companies. Client portal, admin panel, SMS ordering, Stripe billing. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesail — Custom B2B Wholesale Ordering Portals",
    description:
      "Wholesail builds fully custom wholesale ordering portals for distribution companies. Client portal, admin panel, SMS ordering, Stripe billing. Live in under 2 weeks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
}
