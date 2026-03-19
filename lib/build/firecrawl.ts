import { prisma } from "@/lib/db";
import { isAllowedUrl } from "@/lib/utils/ssrf-protection";

export async function scrapeIntakeWebsite(
  intakeId: string,
  url: string,
  inspirationUrls: string[]
) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    // No API key configured — skip scrape silently
    return;
  }

  if (!isAllowedUrl(url)) {
    console.warn("[firecrawl] Blocked SSRF attempt for URL:", url);
    return;
  }

  const MAX_CONTENT_BYTES = 100 * 1024; // 100KB

  try {
    // Scrape main website (markdown + extract formats)
    const websiteRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "extract"],
        extract: {
          schema: {
            type: "object",
            properties: {
              brandColors: { type: "array", items: { type: "string" } },
              logoUrl: { type: "string" },
              companyDescription: { type: "string" },
              productTypes: { type: "array", items: { type: "string" } },
            },
          },
        },
      }),
    });
    const websiteData = await websiteRes.json();

    // Truncate website markdown to 100KB
    if (websiteData?.data?.markdown && typeof websiteData.data.markdown === 'string') {
      websiteData.data.markdown = websiteData.data.markdown.slice(0, MAX_CONTENT_BYTES)
    }

    // Deduplicate, skip the main website URL, and block private/internal URLs before scraping inspirations
    const uniqueInspirationUrls = [...new Set(
      inspirationUrls.filter(u => u && u !== url && isAllowedUrl(u))
    )].slice(0, 3)

    // Scrape up to 3 unique inspiration URLs in parallel
    const inspirationData = await Promise.allSettled(
      uniqueInspirationUrls.map(async (iUrl) => {
        const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: iUrl, formats: ["markdown"] }),
        });
        return { url: iUrl, ...(await r.json()) };
      })
    );

    // Build and size-cap the scrapeData payload
    const inspirations = inspirationData
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);
    const rawScrapeData = {
      website: websiteData,
      inspirations,
      scrapedAt: new Date().toISOString(),
    };
    // If over 100KB, drop inspirations to stay under the limit
    const scrapeData =
      JSON.stringify(rawScrapeData).length <= MAX_CONTENT_BYTES
        ? rawScrapeData
        : { website: websiteData, inspirations: [], scrapedAt: rawScrapeData.scrapedAt };

    // Store in DB
    await prisma.intakeSubmission.update({
      where: { id: intakeId },
      data: { scrapeData },
    });
  } catch (err) {
    console.error("[firecrawl] Scrape failed:", err);
  }
}
