import { prisma } from "@/lib/db";

export async function scrapeIntakeWebsite(
  intakeId: string,
  url: string,
  inspirationUrls: string[]
) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.log("[firecrawl] No API key, skipping scrape");
    return;
  }

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

    // Deduplicate and skip the main website URL before scraping inspirations
    const uniqueInspirationUrls = [...new Set(
      inspirationUrls.filter(u => u && u !== url)
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

    // Store in DB
    await prisma.intakeSubmission.update({
      where: { id: intakeId },
      data: {
        scrapeData: {
          website: websiteData,
          inspirations: inspirationData
            .map((r) => (r.status === "fulfilled" ? r.value : null))
            .filter(Boolean),
          scrapedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error("[firecrawl] Scrape failed:", err);
  }
}
