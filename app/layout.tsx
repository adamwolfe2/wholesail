import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal — Custom B2B Wholesale Ordering Portals",
  description:
    "We build fully custom wholesale ordering portals for distribution companies. Client portal, admin panel, SMS ordering, Stripe billing — all white-labeled to your brand. Try a live demo with your branding in 30 seconds.",
  openGraph: {
    title: "Portal — Custom B2B Wholesale Ordering Portals",
    description:
      "Try a live demo of your custom wholesale ordering portal. Enter your website and see it branded to your company in 30 seconds.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-black antialiased font-serif">
        {children}
      </body>
    </html>
  );
}
