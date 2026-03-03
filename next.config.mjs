import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wholesailhub.com" }],
        destination: "https://wholesailhub.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
