import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/scrape
 * Accepts a website URL, calls Firecrawl to scrape it,
 * and extracts: company name, logo URL, brand colors.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      // Fallback: extract what we can from the domain itself
      return NextResponse.json(fallbackExtract(url));
    }

    // Call Firecrawl scrape API
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: normalizeUrl(url),
        formats: ["html"],
      }),
    });

    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", scrapeRes.status);
      return NextResponse.json(fallbackExtract(url));
    }

    const scrapeData = await scrapeRes.json();
    const html: string = scrapeData?.data?.html || "";
    const metadata = scrapeData?.data?.metadata || {};

    // Extract company name
    const companyName =
      extractCompanyName(metadata, html) || domainToName(url);

    // Extract logo
    const logoUrl = extractLogo(metadata, html, url);

    // Extract brand color
    const brandColor = extractBrandColor(html);

    return NextResponse.json({
      companyName,
      logoUrl,
      brandColor,
      domain: extractDomain(url),
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape website" },
      { status: 500 }
    );
  }
}

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  return u;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace("www.", "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function domainToName(url: string): string {
  const domain = extractDomain(url);
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function cleanTitle(raw: string): string {
  // Split on common delimiters and take the shortest meaningful segment
  // e.g. "Stripe | Financial Infrastructure to Grow Your Revenue" → "Stripe"
  const segments = raw.split(/\s*[|–—:]\s*/);

  // Find the shortest segment that's at least 2 chars (likely the company name)
  const candidates = segments
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    // Remove generic words
    .filter(
      (s) =>
        !/^(home|welcome|official|main|landing|page)$/i.test(s)
    );

  if (candidates.length === 0) return raw.trim();

  // Prefer the first segment if it's short (< 40 chars), otherwise shortest
  if (candidates[0].length < 40) return candidates[0];
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function extractCompanyName(
  metadata: Record<string, string>,
  html: string
): string | null {
  // Try OG site_name first (most reliable)
  const ogSiteName = html.match(
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogSiteName) return ogSiteName[1].trim();

  // Try OG title
  if (metadata.title) {
    return cleanTitle(metadata.title);
  }

  // Try <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return cleanTitle(titleMatch[1]);
  }

  return null;
}

function extractLogo(
  metadata: Record<string, string>,
  html: string,
  url: string
): string {
  const domain = extractDomain(url);
  const base = `https://${domain}`;

  // Try apple-touch-icon (highest quality)
  const appleIcon = html.match(
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i
  );
  if (appleIcon) return resolveUrl(appleIcon[1], base);

  // Try OG image
  if (metadata.ogImage) return metadata.ogImage;

  const ogMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogMatch) return resolveUrl(ogMatch[1], base);

  // Try any icon with size >= 32
  const iconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i
  );
  if (iconMatch) return resolveUrl(iconMatch[1], base);

  // Fallback: Google favicon service
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("/")) return base + href;
  return base + "/" + href;
}

function extractBrandColor(html: string): string {
  // Try theme-color meta tag
  const themeColor = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeColor && isValidHex(themeColor[1])) return themeColor[1];

  // Try msapplication-TileColor
  const tileColor = html.match(
    /<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i
  );
  if (tileColor && isValidHex(tileColor[1])) return tileColor[1];

  // Try first prominent CSS color (skip white/black/gray)
  const cssColors = html.match(
    /(?:background-color|color|background)\s*:\s*(#[0-9a-fA-F]{3,8})/g
  );
  if (cssColors) {
    for (const match of cssColors) {
      const hex = match.match(/#[0-9a-fA-F]{3,8}/)?.[0];
      if (hex && isProminentColor(hex)) return hex;
    }
  }

  // Fallback
  return "#1A1A1A";
}

function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color);
}

function isProminentColor(hex: string): boolean {
  // Expand shorthand
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length < 6) return false;

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  // Skip near-white
  if (r > 230 && g > 230 && b > 230) return false;
  // Skip near-black
  if (r < 25 && g < 25 && b < 25) return false;
  // Skip grays (all channels similar)
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15)
    return false;

  return true;
}

function fallbackExtract(url: string) {
  const domain = extractDomain(url);
  return {
    companyName: domainToName(url),
    logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    brandColor: "#1A1A1A",
    domain,
  };
}
