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
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ai-ified`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
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
    // Tier 1 industry pages
    {
      url: `${BASE_URL}/coffee-tea`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/seafood-meat`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bakery-distribution`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/floral-nursery`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/produce-dairy`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/specialty-food`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/beauty-cosmetics`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pet-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Tier 2 industry pages
    {
      url: `${BASE_URL}/jan-san`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/building-materials`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/agricultural-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/apparel-fashion`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/auto-parts`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/chemical-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    // Tier 3 industry pages
    {
      url: `${BASE_URL}/supplements`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/electrical-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tobacco-vape`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/restaurant-equipment`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/packaging-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/plumbing-hvac`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/office-breakroom`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/craft-art-supply`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/jewelry-accessories`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Competitor comparison blog posts
    {
      url: `${BASE_URL}/blog/wholesail-vs-faire-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-freshline-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-nuorder-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-repspark-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-integrasoft-acctivate-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/wholesail-vs-orderease-for-distributors`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];
}
