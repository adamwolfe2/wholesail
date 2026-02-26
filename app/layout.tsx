import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distribution Portal — Custom B2B Ordering Portal Build",
  description:
    "Get a fully custom wholesale ordering portal built for your distribution business. Client portal, admin panel, SMS ordering, Stripe billing — all white-labeled to your brand.",
  openGraph: {
    title: "Distribution Portal — Custom B2B Ordering Portal Build",
    description:
      "Get a fully custom wholesale ordering portal built for your distribution business in under 2 weeks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-black antialiased">{children}</body>
    </html>
  );
}
