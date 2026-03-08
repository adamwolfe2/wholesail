import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";
import { isAllowedUrl } from "@/lib/utils/ssrf-protection";

// ── Types ──────────────────────────────────────────────────────────────

interface ExtractedProduct {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  unit: string;
  featured: boolean;
}

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

interface SocialLinks {
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
}

interface ScrapeResult {
  companyName: string;
  companyDescription: string;
  industry: string;
  tagline: string;
  valuePropositions: string[];
  yearFounded: string;
  location: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: SocialLinks;
  products: ExtractedProduct[];
  businessType: "B2B" | "B2C" | "Both" | "";
  hasWholesale: boolean;
  deliveryInfo: string;
  paymentInfo: string;
  minimumOrder: string;
  testimonials: Testimonial[];
  clientLogos: string[];
  certifications: string[];
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  aboutSnippet: string;
}

// Raw shape from Firecrawl extract (all optional)
interface FirecrawlExtract {
  companyName?: string;
  companyDescription?: string;
  industry?: string;
  tagline?: string;
  valuePropositions?: string[];
  yearFounded?: string;
  location?: string;
  phone?: string;
  email?: string;
  address?: string;
  socialLinks?: Partial<SocialLinks>;
  products?: Array<{
    name: string;
    description?: string;
    price?: string;
    category?: string;
    imageUrl?: string;
    unit?: string;
    featured?: boolean;
  }>;
  businessType?: string;
  hasWholesale?: boolean;
  deliveryInfo?: string;
  paymentInfo?: string;
  minimumOrder?: string;
  testimonials?: Array<{
    quote?: string;
    author?: string;
    company?: string;
  }>;
  clientLogos?: string[];
  certifications?: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  ctaText?: string;
  aboutSnippet?: string;
}

// ── Main Handler ───────────────────────────────────────────────────────

/**
 * POST /api/scrape
 * Accepts a website URL, calls Firecrawl to scrape it,
 * and extracts everything needed to build a personalized B2B wholesale portal demo.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }

    const rl = await checkRateLimit(aiCallLimiter, userId);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackExtract(url));
    }

    const normalizedUrl = normalizeUrl(url);

    // ── 1. Scrape homepage with HTML + extract ─────────────────────────
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: normalizedUrl,
        formats: ["html", "extract"],
        extract: {
          prompt: HOMEPAGE_EXTRACT_PROMPT,
          schema: FULL_EXTRACT_SCHEMA,
        },
      }),
    });

    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", scrapeRes.status);
      return NextResponse.json(fallbackExtract(url));
    }

    const scrapeData = await scrapeRes.json();
    const html: string = scrapeData?.data?.html || "";
    const metadata = scrapeData?.data?.metadata || {};
    const extracted: FirecrawlExtract = scrapeData?.data?.extract || {};

    // ── 2. Kick off supplemental page scrapes in parallel ──────────────
    const [aboutData, contactData, extraProducts] = await Promise.all([
      trySupplementalPage<AboutPageResult>(normalizedUrl, "/about", ABOUT_EXTRACT_PROMPT, ABOUT_EXTRACT_SCHEMA, apiKey),
      trySupplementalPage<ContactPageResult>(normalizedUrl, "/contact", CONTACT_EXTRACT_PROMPT, CONTACT_EXTRACT_SCHEMA, apiKey),
      tryProductPages(normalizedUrl, apiKey),
    ]);

    // ── 3. Merge company name ──────────────────────────────────────────
    const companyName =
      extracted.companyName ||
      aboutData?.companyName ||
      extractCompanyNameFromHtml(metadata, html) ||
      domainToName(url);

    // ── 4. Logo from HTML ──────────────────────────────────────────────
    const logoUrl = extractLogo(metadata, html, url);

    // ── 5. Extract colors from HTML (primary, secondary, accent) ──────
    const colors = extractColors(html);

    // ── 6. Extract social links from HTML ──────────────────────────────
    const htmlSocialLinks = extractSocialLinksFromHtml(html);

    // ── 7. Extract contact info from HTML ──────────────────────────────
    const htmlContact = extractContactFromHtml(html);

    // ── 8. Build products list ─────────────────────────────────────────
    let products = (extracted.products || []).map(normalizeProduct);

    // Merge extra products from product pages
    if (extraProducts.length > 0) {
      const existing = new Set(products.map((p) => p.name.toLowerCase()));
      for (const ep of extraProducts) {
        if (!existing.has(ep.name.toLowerCase())) {
          products.push(ep);
          existing.add(ep.name.toLowerCase());
        }
      }
    }

    // ── 9. Extract hero content from HTML ──────────────────────────────
    const heroContent = extractHeroContent(html);

    // ── 10. Extract certifications from HTML ───────────────────────────
    const htmlCertifications = extractCertificationsFromHtml(html);

    // ── 11. Extract client logos from HTML ─────────────────────────────
    const htmlClientLogos = extractClientLogosFromHtml(html, url);

    // ── 12. Detect business signals from HTML ──────────────────────────
    const businessSignals = extractBusinessSignals(html);

    // ── 13. Build final result (merge extracted + HTML-parsed + supplemental) ──
    const result: ScrapeResult = {
      companyName,
      companyDescription:
        extracted.companyDescription ||
        aboutData?.aboutSnippet ||
        "",
      industry: extracted.industry || "",
      tagline: extracted.tagline || heroContent.headline || "",
      valuePropositions: extracted.valuePropositions || [],
      yearFounded:
        extracted.yearFounded ||
        aboutData?.yearFounded ||
        extractYearFoundedFromHtml(html) ||
        "",
      location:
        extracted.location ||
        aboutData?.location ||
        contactData?.location ||
        "",

      logoUrl,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      domain: extractDomain(url),

      phone:
        extracted.phone ||
        contactData?.phone ||
        htmlContact.phone ||
        "",
      email:
        extracted.email ||
        contactData?.email ||
        htmlContact.email ||
        "",
      address:
        extracted.address ||
        contactData?.address ||
        "",
      socialLinks: mergeSocialLinks(
        extracted.socialLinks,
        contactData?.socialLinks,
        htmlSocialLinks
      ),

      products: products.slice(0, 20),

      businessType: normalizeBusinessType(
        extracted.businessType || businessSignals.businessType
      ),
      hasWholesale:
        extracted.hasWholesale ??
        businessSignals.hasWholesale,
      deliveryInfo: extracted.deliveryInfo || businessSignals.deliveryInfo || "",
      paymentInfo: extracted.paymentInfo || businessSignals.paymentInfo || "",
      minimumOrder: extracted.minimumOrder || businessSignals.minimumOrder || "",

      testimonials: (extracted.testimonials || []).map((t) => ({
        quote: t.quote || "",
        author: t.author || "",
        company: t.company || "",
      })),
      clientLogos: dedup([
        ...(extracted.clientLogos || []),
        ...htmlClientLogos,
      ]),
      certifications: dedup([
        ...(extracted.certifications || []),
        ...htmlCertifications,
      ]),

      heroHeadline:
        extracted.heroHeadline || heroContent.headline || "",
      heroSubheadline:
        extracted.heroSubheadline || heroContent.subheadline || "",
      ctaText: extracted.ctaText || heroContent.ctaText || "",
      aboutSnippet:
        extracted.aboutSnippet ||
        aboutData?.aboutSnippet ||
        "",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape website" },
      { status: 500 }
    );
  }
}

// ── Firecrawl Extract Schemas & Prompts ────────────────────────────────

const HOMEPAGE_EXTRACT_PROMPT = `Extract comprehensive information from this webpage to build a B2B wholesale ordering portal demo.

For products/services: get name, description, price, category, image URL, unit of sale (oz, case, lb, each, etc.), and whether it appears to be a featured/hero product.

For company info: get the company name, description, industry, tagline/slogan (usually the hero heading), value propositions (3-5 USPs), year founded, and location.

For contact: get phone number, email, physical address.

For social media: get URLs for Instagram, Facebook, LinkedIn, Twitter/X.

For business signals: determine if B2B, B2C, or Both. Check for wholesale programs, delivery/shipping info, payment terms, minimum order quantities.

For social proof: extract testimonials (quote, author, company), client/partner logo image URLs, and certifications (Organic, Fair Trade, USDA, Kosher, etc.).

For hero content: get the main headline, subheadline, and primary CTA button text.

For about info: get a 1-2 sentence about summary.`;

const FULL_EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    companyName: {
      type: "string" as const,
      description: "The company or brand name",
    },
    companyDescription: {
      type: "string" as const,
      description: "One-sentence description of what the company does",
    },
    industry: {
      type: "string" as const,
      description: "The industry or sector (e.g. Food & Beverage, Technology)",
    },
    tagline: {
      type: "string" as const,
      description: "The company tagline, slogan, or hero heading",
    },
    valuePropositions: {
      type: "array" as const,
      description: "3-5 unique selling propositions or key benefits",
      items: { type: "string" as const },
    },
    yearFounded: {
      type: "string" as const,
      description: "Year the company was founded (e.g. '2015')",
    },
    location: {
      type: "string" as const,
      description: "Company location (city, state)",
    },
    phone: {
      type: "string" as const,
      description: "Company phone number",
    },
    email: {
      type: "string" as const,
      description: "Company email address",
    },
    address: {
      type: "string" as const,
      description: "Full physical address",
    },
    socialLinks: {
      type: "object" as const,
      description: "Social media profile URLs",
      properties: {
        instagram: { type: "string" as const, description: "Instagram URL" },
        facebook: { type: "string" as const, description: "Facebook URL" },
        linkedin: { type: "string" as const, description: "LinkedIn URL" },
        twitter: { type: "string" as const, description: "Twitter/X URL" },
      },
    },
    products: {
      type: "array" as const,
      description: "Products, services, or offerings found on the page",
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const, description: "Product or service name" },
          description: { type: "string" as const, description: "Short description (1-2 sentences)" },
          price: { type: "string" as const, description: "Price if shown (e.g. '$29.99', '$150/case')" },
          category: { type: "string" as const, description: "Product category or type" },
          imageUrl: { type: "string" as const, description: "URL of the product image" },
          unit: { type: "string" as const, description: "Unit of sale (oz, case, lb, each, bottle, bag, etc.)" },
          featured: { type: "boolean" as const, description: "Whether this appears to be a featured or hero product" },
        },
        required: ["name"] as const,
      },
    },
    businessType: {
      type: "string" as const,
      description: "Business model: 'B2B', 'B2C', or 'Both'",
    },
    hasWholesale: {
      type: "boolean" as const,
      description: "Whether the company offers wholesale or bulk ordering",
    },
    deliveryInfo: {
      type: "string" as const,
      description: "Delivery areas, shipping info, or distribution details",
    },
    paymentInfo: {
      type: "string" as const,
      description: "Payment terms, methods, or net terms mentioned",
    },
    minimumOrder: {
      type: "string" as const,
      description: "Minimum order quantity or amount if mentioned",
    },
    testimonials: {
      type: "array" as const,
      description: "Customer testimonials or reviews",
      items: {
        type: "object" as const,
        properties: {
          quote: { type: "string" as const, description: "The testimonial text" },
          author: { type: "string" as const, description: "Author name" },
          company: { type: "string" as const, description: "Author's company" },
        },
      },
    },
    clientLogos: {
      type: "array" as const,
      description: "URLs of partner, client, or 'as seen in' logos",
      items: { type: "string" as const },
    },
    certifications: {
      type: "array" as const,
      description: "Certifications like Organic, Fair Trade, USDA, Kosher, Halal, Non-GMO, etc.",
      items: { type: "string" as const },
    },
    heroHeadline: {
      type: "string" as const,
      description: "Main hero heading text on the page",
    },
    heroSubheadline: {
      type: "string" as const,
      description: "Subheading or supporting text below the hero headline",
    },
    ctaText: {
      type: "string" as const,
      description: "Text of the primary call-to-action button",
    },
    aboutSnippet: {
      type: "string" as const,
      description: "1-2 sentence about us summary",
    },
  },
};

// ── About page schema ──────────────────────────────────────────────────

const ABOUT_EXTRACT_PROMPT = `Extract company background information from this About page.
Get: company name, a 2-3 sentence about summary, year founded, location (city, state),
team members or founders mentioned, company values, and any certifications or awards.`;

const ABOUT_EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    companyName: { type: "string" as const },
    aboutSnippet: {
      type: "string" as const,
      description: "2-3 sentence company summary from the about page",
    },
    yearFounded: { type: "string" as const },
    location: { type: "string" as const, description: "City, State" },
    certifications: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    valuePropositions: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
};

// ── Contact page schema ────────────────────────────────────────────────

const CONTACT_EXTRACT_PROMPT = `Extract all contact information from this contact page.
Get: phone number, email address, physical address, location (city, state),
and any social media links (Instagram, Facebook, LinkedIn, Twitter/X URLs).`;

const CONTACT_EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    phone: { type: "string" as const },
    email: { type: "string" as const },
    address: { type: "string" as const },
    location: { type: "string" as const, description: "City, State" },
    socialLinks: {
      type: "object" as const,
      properties: {
        instagram: { type: "string" as const },
        facebook: { type: "string" as const },
        linkedin: { type: "string" as const },
        twitter: { type: "string" as const },
      },
    },
  },
};

// ── Supplemental page scraper ──────────────────────────────────────────

interface AboutPageResult {
  companyName?: string;
  aboutSnippet?: string;
  yearFounded?: string;
  location?: string;
  certifications?: string[];
  valuePropositions?: string[];
}

interface ContactPageResult {
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  socialLinks?: Partial<SocialLinks>;
}

async function trySupplementalPage<T extends AboutPageResult | ContactPageResult>(
  baseUrl: string,
  path: string,
  prompt: string,
  schema: object,
  apiKey: string
): Promise<T | null> {
  // Try with and without common path variants
  const paths = [path, `${path}-us`, `${path}us`];
  if (path === "/about") paths.push("/our-story", "/who-we-are", "/company");
  if (path === "/contact") paths.push("/contact-us", "/get-in-touch", "/connect");

  for (const p of paths) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: baseUrl.replace(/\/$/, "") + p,
          formats: ["extract"],
          extract: { prompt, schema },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const extract = data?.data?.extract;
      if (extract && Object.keys(extract).length > 0) {
        return extract as T;
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ── Product pages scraper ──────────────────────────────────────────────

async function tryProductPages(
  baseUrl: string,
  apiKey: string
): Promise<ExtractedProduct[]> {
  const paths = [
    "/products",
    "/shop",
    "/catalog",
    "/menu",
    "/collections",
    "/services",
    "/our-products",
    "/wholesale",
    "/order",
  ];

  for (const path of paths) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: baseUrl.replace(/\/$/, "") + path,
          formats: ["extract"],
          extract: {
            prompt:
              "Extract all products, services, or offerings listed on this page. " +
              "For each, get the name, short description, price (if shown), category, " +
              "image URL, unit of sale (oz, case, lb, each, etc.), and whether it seems to be a featured product.",
            schema: {
              type: "object" as const,
              properties: {
                products: {
                  type: "array" as const,
                  items: {
                    type: "object" as const,
                    properties: {
                      name: { type: "string" as const },
                      description: { type: "string" as const },
                      price: { type: "string" as const },
                      category: { type: "string" as const },
                      imageUrl: { type: "string" as const },
                      unit: { type: "string" as const },
                      featured: { type: "boolean" as const },
                    },
                    required: ["name"] as const,
                  },
                },
              },
            },
          },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const products = data?.data?.extract?.products || [];
      if (products.length >= 2) {
        return products.map(normalizeProduct);
      }
    } catch {
      continue;
    }
  }
  return [];
}

// ── HTML Extraction Helpers ────────────────────────────────────────────

function extractColors(html: string): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const colorCandidates: { color: string; context: string }[] = [];

  // 1. Check meta theme-color
  const themeColor = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeColor && isValidHex(themeColor[1])) {
    colorCandidates.push({ color: themeColor[1], context: "theme" });
  }

  // 2. Check msapplication-TileColor
  const tileColor = html.match(
    /<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i
  );
  if (tileColor && isValidHex(tileColor[1])) {
    colorCandidates.push({ color: tileColor[1], context: "theme" });
  }

  // 3. CSS custom properties (--primary-color, --brand-color, etc.)
  const cssVarPatterns = [
    /--(?:primary|brand|main|theme)[-_]?color\s*:\s*(#[0-9a-fA-F]{3,8})/gi,
    /--(?:secondary|accent|highlight)[-_]?color\s*:\s*(#[0-9a-fA-F]{3,8})/gi,
    /--(?:color-primary|color-brand|color-main)\s*:\s*(#[0-9a-fA-F]{3,8})/gi,
    /--(?:color-secondary|color-accent|color-highlight)\s*:\s*(#[0-9a-fA-F]{3,8})/gi,
  ];

  for (const pattern of cssVarPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      const isAccent = /accent|highlight|secondary/i.test(m[0]);
      colorCandidates.push({
        color: m[1],
        context: isAccent ? "accent" : "primary",
      });
    }
  }

  // 4. Tailwind-style CSS vars (--primary, --accent, etc.) with HSL
  const tailwindHslPatterns = [
    /--primary\s*:\s*([^;}\n]+)/gi,
    /--accent\s*:\s*([^;}\n]+)/gi,
    /--secondary\s*:\s*([^;}\n]+)/gi,
  ];
  for (const pattern of tailwindHslPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      const hslHex = hslStringToHex(m[1].trim());
      if (hslHex) {
        const isAccent = /accent/i.test(m[0]);
        const isSecondary = /secondary/i.test(m[0]);
        colorCandidates.push({
          color: hslHex,
          context: isAccent ? "accent" : isSecondary ? "secondary" : "primary",
        });
      }
    }
  }

  // 5. Inline background-color and color on key elements (header, nav, button)
  const headerBg = html.match(
    /<(?:header|nav)[^>]*style=["'][^"']*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/i
  );
  if (headerBg && isValidHex(headerBg[1])) {
    colorCandidates.push({ color: headerBg[1], context: "primary" });
  }

  // 6. Button background colors (likely accent)
  const buttonBg = html.match(
    /<(?:button|a)[^>]*style=["'][^"']*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/i
  );
  if (buttonBg && isValidHex(buttonBg[1])) {
    colorCandidates.push({ color: buttonBg[1], context: "accent" });
  }

  // 7. Generic CSS color extraction (background-color, color, background)
  {
    const cssColorRegex = /(?:background-color|color|background)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
    let cssMatch: RegExpExecArray | null;
    while ((cssMatch = cssColorRegex.exec(html)) !== null) {
      const hex = cssMatch[1];
      if (hex && isValidHex(hex) && isProminentColor(hex)) {
        const isBg = cssMatch[0].startsWith("background");
        colorCandidates.push({
          color: hex,
          context: isBg ? "primary" : "accent",
        });
      }
    }
  }

  // 8. RGB colors
  {
    const rgbRegex = /(?:background-color|color|background)\s*:\s*rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/g;
    let rgbMatch: RegExpExecArray | null;
    while ((rgbMatch = rgbRegex.exec(html)) !== null) {
      const hex = rgbToHex(
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3])
      );
      if (isProminentColor(hex)) {
        const isBg = rgbMatch[0].startsWith("background");
        colorCandidates.push({ color: hex, context: isBg ? "primary" : "accent" });
      }
    }
  }

  // Deduplicate and assign
  const seen = new Set<string>();
  const primary: string[] = [];
  const secondary: string[] = [];
  const accent: string[] = [];

  for (const c of colorCandidates) {
    const normalized = normalizeHex(c.color);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    if (c.context === "theme" || c.context === "primary") {
      primary.push(normalized);
    } else if (c.context === "secondary") {
      secondary.push(normalized);
    } else if (c.context === "accent") {
      accent.push(normalized);
    }
  }

  // Fallback: pick from generic colors if categories are empty
  const allProminentColors = colorCandidates
    .map((c) => normalizeHex(c.color))
    .filter((c) => isProminentColor(c));
  const uniqueProminent = Array.from(new Set(allProminentColors));

  return {
    primary: primary[0] || uniqueProminent[0] || "#1A1A1A",
    secondary:
      secondary[0] ||
      uniqueProminent.find(
        (c) => c !== (primary[0] || uniqueProminent[0])
      ) ||
      "#4A4A4A",
    accent:
      accent[0] ||
      uniqueProminent.find(
        (c) =>
          c !== (primary[0] || uniqueProminent[0]) &&
          c !== (secondary[0] || "#4A4A4A")
      ) ||
      "#2563EB",
  };
}

function extractSocialLinksFromHtml(html: string): Partial<SocialLinks> {
  const links: Partial<SocialLinks> = {};

  const instagramMatch = html.match(
    /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s>]+)["']/i
  );
  if (instagramMatch) links.instagram = instagramMatch[1];

  const facebookMatch = html.match(
    /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s>]+)["']/i
  );
  if (facebookMatch) links.facebook = facebookMatch[1];

  const linkedinMatch = html.match(
    /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s>]+)["']/i
  );
  if (linkedinMatch) links.linkedin = linkedinMatch[1];

  const twitterMatch = html.match(
    /href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s>]+)["']/i
  );
  if (twitterMatch) links.twitter = twitterMatch[1];

  return links;
}

function extractContactFromHtml(html: string): {
  phone: string;
  email: string;
} {
  let phone = "";
  let email = "";

  // Phone: tel: links
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
  if (telMatch) {
    phone = telMatch[1].replace(/[^\d+()-\s]/g, "").trim();
  }
  // Phone: pattern in text
  if (!phone) {
    const phonePattern = html.match(
      /(?:phone|tel|call)[:\s]*([+]?[\d\s().-]{10,})/i
    );
    if (phonePattern) phone = phonePattern[1].trim();
  }

  // Email: mailto links
  const mailtoMatch = html.match(/href=["']mailto:([^"'?]+)/i);
  if (mailtoMatch) {
    email = mailtoMatch[1].trim();
  }
  // Email: visible email pattern
  if (!email) {
    const emailPattern = html.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (emailPattern) email = emailPattern[0];
  }

  return { phone, email };
}

function extractHeroContent(html: string): {
  headline: string;
  subheadline: string;
  ctaText: string;
} {
  let headline = "";
  let subheadline = "";
  let ctaText = "";

  // Try to find h1 (usually the hero headline)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    headline = h1Match[1].trim();
  }
  // Also try h1 with nested elements
  if (!headline) {
    const h1NestedMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1NestedMatch) {
      headline = stripHtmlTags(h1NestedMatch[1]).trim();
    }
  }

  // Subheadline: first h2, or p right after h1
  const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (h2Match) {
    subheadline = h2Match[1].trim();
  }
  if (!subheadline) {
    const h2NestedMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2NestedMatch) {
      subheadline = stripHtmlTags(h2NestedMatch[1]).trim();
    }
  }

  // CTA: first prominent button or link
  const ctaPatterns = [
    /<a[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([^<]+)<\/a>/i,
    /<button[^>]*>([^<]+)<\/button>/i,
    /<a[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i,
  ];
  for (const pattern of ctaPatterns) {
    const match = html.match(pattern);
    if (match) {
      const text = stripHtmlTags(match[1]).trim();
      if (text && text.length < 50) {
        ctaText = text;
        break;
      }
    }
  }

  return { headline, subheadline, ctaText };
}

function extractCertificationsFromHtml(html: string): string[] {
  const certs: string[] = [];
  const certKeywords = [
    "Organic",
    "USDA Organic",
    "Fair Trade",
    "Non-GMO",
    "Kosher",
    "Halal",
    "Gluten-Free",
    "Gluten Free",
    "Vegan",
    "B Corp",
    "ISO 9001",
    "ISO 22000",
    "HACCP",
    "GMP",
    "FDA Approved",
    "SQF",
    "BRC",
    "Rainforest Alliance",
    "UTZ Certified",
    "Fairtrade",
    "Certified Humane",
    "Animal Welfare Approved",
    "Sustainably Sourced",
    "Carbon Neutral",
    "Whole30 Approved",
    "Paleo",
    "Keto Certified",
    "Women-Owned",
    "Minority-Owned",
    "Small Business",
  ];

  const htmlLower = html.toLowerCase();
  for (const cert of certKeywords) {
    if (htmlLower.includes(cert.toLowerCase())) {
      certs.push(cert);
    }
  }

  return certs;
}

function extractClientLogosFromHtml(html: string, url: string): string[] {
  const logos: string[] = [];
  const domain = extractDomain(url);
  const base = `https://${domain}`;

  // Look for images in sections typically labeled "partners", "clients", "as seen in", "trusted by"
  const partnerSections = html.match(
    /(?:partners?|clients?|trusted\s+by|as\s+seen\s+in|featured\s+in|our\s+customers)[^]*?(<img[^>]+>(?:\s*<img[^>]+>)*)/gi
  );

  if (partnerSections) {
    for (const section of partnerSections) {
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*/gi;
      let imgMatch: RegExpExecArray | null;
      while ((imgMatch = imgRegex.exec(section)) !== null) {
        const src = resolveUrl(imgMatch[1], base);
        if (src && !src.includes("pixel") && !src.includes("tracking")) {
          logos.push(src);
        }
      }
    }
  }

  // Also look for images with alt text suggesting client logos
  const logoImgRegex = /<img[^>]*alt=["']([^"']*(?:logo|partner|client|brand)[^"']*)["'][^>]*src=["']([^"']+)["']/gi;
  let logoMatch: RegExpExecArray | null;
  while ((logoMatch = logoImgRegex.exec(html)) !== null) {
    const src = resolveUrl(logoMatch[2], base);
    if (src) logos.push(src);
  }

  return Array.from(new Set(logos)).slice(0, 10);
}

function extractBusinessSignals(html: string): {
  businessType: string;
  hasWholesale: boolean;
  deliveryInfo: string;
  paymentInfo: string;
  minimumOrder: string;
} {
  const htmlLower = html.toLowerCase();

  // Business type detection
  let businessType = "";
  const b2bSignals = [
    "wholesale",
    "bulk order",
    "distributor",
    "trade account",
    "net 30",
    "net 60",
    "purchase order",
    "b2b",
    "business to business",
    "for businesses",
    "reseller",
    "foodservice",
    "food service",
  ];
  const b2cSignals = [
    "add to cart",
    "buy now",
    "shop now",
    "consumer",
    "retail",
    "free shipping",
    "b2c",
  ];

  const b2bCount = b2bSignals.filter((s) => htmlLower.includes(s)).length;
  const b2cCount = b2cSignals.filter((s) => htmlLower.includes(s)).length;

  if (b2bCount > 0 && b2cCount > 0) businessType = "Both";
  else if (b2bCount > 0) businessType = "B2B";
  else if (b2cCount > 0) businessType = "B2C";

  // Wholesale detection
  const hasWholesale =
    htmlLower.includes("wholesale") ||
    htmlLower.includes("bulk order") ||
    htmlLower.includes("trade account") ||
    htmlLower.includes("distributor");

  // Delivery info
  let deliveryInfo = "";
  const deliveryPatterns = [
    /(?:deliver(?:y|ies)|shipping|ship to|we deliver|delivery area)[^.]*\./i,
    /(?:free shipping|flat rate|local delivery|nationwide|nationwide shipping)[^.]*\./i,
  ];
  for (const pattern of deliveryPatterns) {
    const match = html.match(pattern);
    if (match) {
      deliveryInfo = stripHtmlTags(match[0]).trim();
      break;
    }
  }

  // Payment info
  let paymentInfo = "";
  const paymentPatterns = [
    /(?:net\s*\d+|payment terms|pay(?:ment)?\s+(?:method|option)s?|accepted payment)[^.]*\./i,
    /(?:credit card|invoice|wire transfer|ach|purchase order)[^.]*terms[^.]*\./i,
  ];
  for (const pattern of paymentPatterns) {
    const match = html.match(pattern);
    if (match) {
      paymentInfo = stripHtmlTags(match[0]).trim();
      break;
    }
  }

  // Minimum order
  let minimumOrder = "";
  const moqPatterns = [
    /(?:minimum\s+order|min(?:\.|imum)?\s+qty|moq|minimum\s+purchase)[^.]*\./i,
    /\$\d+[^.]*minimum[^.]*\./i,
  ];
  for (const pattern of moqPatterns) {
    const match = html.match(pattern);
    if (match) {
      minimumOrder = stripHtmlTags(match[0]).trim();
      break;
    }
  }

  return { businessType, hasWholesale, deliveryInfo, paymentInfo, minimumOrder };
}

function extractYearFoundedFromHtml(html: string): string {
  // Look for patterns like "Founded in 2015", "Since 2010", "Est. 2008"
  const patterns = [
    /(?:founded|established|est\.?|since)\s+(?:in\s+)?(\d{4})/i,
    /(?:since|from)\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      if (year >= 1800 && year <= new Date().getFullYear()) {
        return match[1];
      }
    }
  }
  return "";
}

// ── Core Helpers ───────────────────────────────────────────────────────

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
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
}

function domainToName(url: string): string {
  const domain = extractDomain(url);
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function cleanTitle(raw: string): string {
  const segments = raw.split(/\s*[|–—:]\s*/);
  const candidates = segments
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .filter(
      (s) => !/^(home|welcome|official|main|landing|page)$/i.test(s)
    );
  if (candidates.length === 0) return raw.trim();
  if (candidates[0].length < 40) return candidates[0];
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function extractCompanyNameFromHtml(
  metadata: Record<string, string>,
  html: string
): string | null {
  const ogSiteName = html.match(
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogSiteName) return ogSiteName[1].trim();

  if (metadata.title) return cleanTitle(metadata.title);

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return cleanTitle(titleMatch[1]);

  return null;
}

function extractLogo(
  metadata: Record<string, string>,
  html: string,
  url: string
): string {
  const domain = extractDomain(url);
  const base = `https://${domain}`;

  // 1. JSON-LD structured data logo (highest quality, explicitly declared)
  const jsonLdLogo = html.match(
    /"logo"\s*:\s*(?:"([^"]+)"|{"url"\s*:\s*"([^"]+)"})/i
  );
  if (jsonLdLogo) {
    const logoSrc = jsonLdLogo[1] || jsonLdLogo[2];
    if (logoSrc) return resolveUrl(logoSrc, base);
  }

  // 2. Image with "logo" in class, id, or alt (usually the actual site logo)
  const logoImg = html.match(
    /<img[^>]*(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i
  );
  if (logoImg) return resolveUrl(logoImg[1], base);

  // 3. Image with src containing "logo" in the path
  const logoSrc = html.match(
    /<img[^>]*src=["']([^"']*logo[^"']*)["']/i
  );
  if (logoSrc) return resolveUrl(logoSrc[1], base);

  // 4. SVG with "logo" in class or id (many modern sites use inline SVG logos)
  const svgLogo = html.match(
    /<svg[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*>/i
  );
  if (svgLogo) {
    // Can't extract inline SVG as URL, fall through to favicon
  }

  // 5. Apple touch icon (good quality, 180x180 typically)
  const appleIcon = html.match(
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i
  );
  if (appleIcon) return resolveUrl(appleIcon[1], base);

  // 6. Favicon link tags (various rel values)
  const iconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i
  );
  if (iconMatch) return resolveUrl(iconMatch[1], base);

  // 7. Larger favicon variants (icon with sizes)
  const icon32 = html.match(
    /<link[^>]*rel=["']icon["'][^>]*sizes=["']32x32["'][^>]*href=["']([^"']+)["']/i
  );
  if (icon32) return resolveUrl(icon32[1], base);

  // 8. Google favicon service — reliable fallback, always returns something usable
  // DELIBERATELY skip og:image — it's a social share image, not a logo
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("/")) return base + href;
  return base + "/" + href;
}

// ── Color Helpers ──────────────────────────────────────────────────────

function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color);
}

function normalizeHex(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return "#" + h.substring(0, 6).toUpperCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function hslStringToHex(hsl: string): string | null {
  // Parse "220 14% 96%" or "220, 14%, 96%" or "hsl(220, 14%, 96%)"
  const match = hsl.match(
    /(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%?[,\s]+(\d+(?:\.\d+)?)%?/
  );
  if (!match) return null;

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return rgbToHex(gray, gray, gray);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return rgbToHex(r, g, b);
}

function isProminentColor(hex: string): boolean {
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
  if (
    Math.abs(r - g) < 15 &&
    Math.abs(g - b) < 15 &&
    Math.abs(r - b) < 15
  )
    return false;
  return true;
}

// ── Data Helpers ───────────────────────────────────────────────────────

function normalizeProduct(p: {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  unit?: string;
  featured?: boolean;
}): ExtractedProduct {
  return {
    name: p.name,
    description: p.description || "",
    price: p.price || "",
    category: p.category || "Products",
    imageUrl: p.imageUrl || "",
    unit: p.unit || "",
    featured: p.featured ?? false,
  };
}

function normalizeBusinessType(
  raw: string
): "B2B" | "B2C" | "Both" | "" {
  if (!raw) return "";
  const upper = raw.toUpperCase().trim();
  if (upper === "B2B") return "B2B";
  if (upper === "B2C") return "B2C";
  if (upper === "BOTH" || (upper.includes("B2B") && upper.includes("B2C")))
    return "Both";
  return "";
}

function mergeSocialLinks(
  ...sources: (Partial<SocialLinks> | undefined | null)[]
): SocialLinks {
  const merged: SocialLinks = {
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
  };

  for (const source of sources) {
    if (!source) continue;
    if (source.instagram && !merged.instagram)
      merged.instagram = source.instagram;
    if (source.facebook && !merged.facebook)
      merged.facebook = source.facebook;
    if (source.linkedin && !merged.linkedin)
      merged.linkedin = source.linkedin;
    if (source.twitter && !merged.twitter)
      merged.twitter = source.twitter;
  }

  return merged;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function dedup(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

// ── Fallback ───────────────────────────────────────────────────────────

function fallbackExtract(url: string): ScrapeResult {
  const domain = extractDomain(url);
  return {
    companyName: domainToName(url),
    companyDescription: "",
    industry: "",
    tagline: "",
    valuePropositions: [],
    yearFounded: "",
    location: "",
    logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    primaryColor: "#1A1A1A",
    secondaryColor: "#4A4A4A",
    accentColor: "#2563EB",
    domain,
    phone: "",
    email: "",
    address: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
    },
    products: [],
    businessType: "",
    hasWholesale: false,
    deliveryInfo: "",
    paymentInfo: "",
    minimumOrder: "",
    testimonials: [],
    clientLogos: [],
    certifications: [],
    heroHeadline: "",
    heroSubheadline: "",
    ctaText: "",
    aboutSnippet: "",
  };
}
