import { MetadataRoute } from "next";

const BASE_URL = "https://wholesailhub.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/why-distribution-companies-are-replacing-spreadsheets-with-ordering-portals`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesale-ordering-software-complete-guide`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/how-to-set-up-net-30-billing-for-wholesale-clients`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/shopify-b2b-vs-custom-wholesale-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/food-beverage-distribution-wholesale-ordering-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wine-spirits-distributor-ordering-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-netsuite-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/replace-quickbooks-spreadsheets-with-ordering-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/hubspot-salesforce-distribution-alternatives`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/industrial-supply-distribution-online-ordering`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/produce-distribution-ordering-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/craft-beverage-beer-distributor-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/how-to-onboard-wholesale-clients-to-an-ordering-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/how-to-set-wholesale-pricing-tiers`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/handshake-faire-vs-custom-wholesale-portal`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    // Industry landing pages
    {
      url: `${BASE_URL}/food-beverage`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/wine-spirits`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/industrial-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
