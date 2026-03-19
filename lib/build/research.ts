import Anthropic from "@anthropic-ai/sdk";

interface ResearchInput {
  companyName: string;
  industry: string;
  website: string | null;
  location: string | null;
  productCategories: string | null;
  selectedFeatures: string[];
  additionalNotes: string | null;
  scrapeData: Record<string, unknown> | null;
}

interface ResearchOutput {
  industryLandscape: string;
  companyIntelligence: string;
  painPoints: string;
  competitorSoftware: string;
  seoKeywords: string[];
  marketingAngles: string[];
  catalogCategories: string[];
  industryTerminology: Record<string, string>;
  synthesizedBrief: string;
  researchedAt: string;
}

interface TavilySearchResult {
  answer?: string;
  results?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

const EMPTY_RESEARCH_OUTPUT: ResearchOutput = {
  industryLandscape: "",
  companyIntelligence: "",
  painPoints: "",
  competitorSoftware: "",
  seoKeywords: [],
  marketingAngles: [],
  catalogCategories: [],
  industryTerminology: {},
  synthesizedBrief: "",
  researchedAt: new Date().toISOString(),
};

async function tavilySearch(
  query: string,
  apiKey: string
): Promise<TavilySearchResult | null> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!res.ok) {
      console.error(`[research] Tavily search failed (${res.status}):`, query);
      return null;
    }

    return (await res.json()) as TavilySearchResult;
  } catch (err) {
    console.error("[research] Tavily search error:", err);
    return null;
  }
}

function buildBasicOutput(
  searches: {
    company: TavilySearchResult | null;
    competitors: TavilySearchResult | null;
    painPoints: TavilySearchResult | null;
    seoMarketing: TavilySearchResult | null;
  },
  input: ResearchInput
): ResearchOutput {
  return {
    industryLandscape:
      searches.competitors?.answer ||
      `${input.industry} wholesale distribution market.`,
    companyIntelligence:
      searches.company?.answer ||
      `${input.companyName} operates in the ${input.industry} distribution space.`,
    painPoints:
      searches.painPoints?.answer ||
      "Common pain points include manual ordering processes, inventory management, and client communication.",
    competitorSoftware:
      searches.competitors?.answer ||
      "Common platforms include custom portals, ERPs, and spreadsheet-based ordering.",
    seoKeywords: input.productCategories
      ? input.productCategories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [`${input.industry} wholesale`, `${input.industry} distributor`],
    marketingAngles: [
      `Streamline ${input.industry} wholesale ordering`,
      "Reduce manual order processing time by 80%",
      "Give clients 24/7 ordering access",
    ],
    catalogCategories: input.productCategories
      ? input.productCategories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [],
    industryTerminology: {},
    synthesizedBrief: [
      searches.company?.answer,
      searches.competitors?.answer,
      searches.painPoints?.answer,
      searches.seoMarketing?.answer,
    ]
      .filter(Boolean)
      .join("\n\n") ||
      `${input.companyName} is a ${input.industry} distributor looking to modernize their ordering process.`,
    researchedAt: new Date().toISOString(),
  };
}

export async function runResearchPipeline(
  input: ResearchInput
): Promise<ResearchOutput> {
  const tavilyKey = process.env.TAVILY_API_KEY;

  // ── Step 1: Tavily searches ──────────────────────────────────────────
  if (!tavilyKey) {
    // No TAVILY_API_KEY configured — skip research pipeline
    return {
      ...EMPTY_RESEARCH_OUTPUT,
      synthesizedBrief:
        "Research skipped: TAVILY_API_KEY not configured. Populate the environment variable and re-run.",
      researchedAt: new Date().toISOString(),
    };
  }

  const { companyName, industry } = input;

  const [company, competitors, painPoints, seoMarketing] =
    await Promise.allSettled([
      tavilySearch(
        `"${companyName}" ${industry} wholesale distribution`,
        tavilyKey
      ),
      tavilySearch(
        `B2B wholesale ${industry} distribution software platform competitors`,
        tavilyKey
      ),
      tavilySearch(
        `wholesale ${industry} distribution pain points challenges ordering fulfillment`,
        tavilyKey
      ),
      tavilySearch(
        `${industry} wholesale distributor SEO keywords marketing`,
        tavilyKey
      ),
    ]);

  const searches = {
    company:
      company.status === "fulfilled" ? company.value : null,
    competitors:
      competitors.status === "fulfilled" ? competitors.value : null,
    painPoints:
      painPoints.status === "fulfilled" ? painPoints.value : null,
    seoMarketing:
      seoMarketing.status === "fulfilled" ? seoMarketing.value : null,
  };

  // ── Step 2: Synthesize with Claude Sonnet ────────────────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return buildBasicOutput(searches, input);
  }

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const userPrompt = `
Here is research data for a new client portal build. Analyze and synthesize it into structured intelligence.

## Client Info
- Company: ${input.companyName}
- Industry: ${input.industry}
- Website: ${input.website || "N/A"}
- Location: ${input.location || "N/A"}
- Product Categories: ${input.productCategories || "N/A"}
- Selected Features: ${input.selectedFeatures.join(", ") || "None specified"}
- Additional Notes: ${input.additionalNotes || "None"}

## Firecrawl Scrape Data
${input.scrapeData ? JSON.stringify(input.scrapeData, null, 2).slice(0, 8000) : "No scrape data available."}

## Tavily Search Results

### Company Intelligence
${searches.company ? JSON.stringify(searches.company, null, 2).slice(0, 4000) : "Search failed or unavailable."}

### Competitor Landscape
${searches.competitors ? JSON.stringify(searches.competitors, null, 2).slice(0, 4000) : "Search failed or unavailable."}

### Industry Pain Points
${searches.painPoints ? JSON.stringify(searches.painPoints, null, 2).slice(0, 4000) : "Search failed or unavailable."}

### SEO & Marketing
${searches.seoMarketing ? JSON.stringify(searches.seoMarketing, null, 2).slice(0, 4000) : "Search failed or unavailable."}

Return a JSON object with these exact keys:
- "industryLandscape": string — market overview, key players, trends (2-3 paragraphs)
- "companyIntelligence": string — what we found about this specific company (1-2 paragraphs)
- "painPoints": string — industry-specific pain points in distribution and ordering (2-3 paragraphs)
- "competitorSoftware": string — what software/platforms competitors use (1-2 paragraphs)
- "seoKeywords": string[] — top 20 SEO keywords for their vertical
- "marketingAngles": string[] — 5-7 value propositions tailored to their industry
- "catalogCategories": string[] — suggested product categories for their catalog
- "industryTerminology": Record<string, string> — industry-specific terms and definitions (e.g. "case" vs "unit", "FOB" vs "delivered")
- "synthesizedBrief": string — 500-word executive brief combining all research

Return ONLY the JSON object, no markdown fences or explanation.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are a B2B distribution industry analyst. Synthesize the provided research into structured intelligence for building a custom wholesale ordering portal. Always respond with valid JSON only.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("[research] No text block in Claude response");
      return buildBasicOutput(searches, input);
    }

    // Strip markdown fences if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    const parsed = JSON.parse(jsonText) as Omit<ResearchOutput, "researchedAt">;

    return {
      industryLandscape: parsed.industryLandscape || "",
      companyIntelligence: parsed.companyIntelligence || "",
      painPoints: parsed.painPoints || "",
      competitorSoftware: parsed.competitorSoftware || "",
      seoKeywords: Array.isArray(parsed.seoKeywords)
        ? parsed.seoKeywords
        : [],
      marketingAngles: Array.isArray(parsed.marketingAngles)
        ? parsed.marketingAngles
        : [],
      catalogCategories: Array.isArray(parsed.catalogCategories)
        ? parsed.catalogCategories
        : [],
      industryTerminology:
        parsed.industryTerminology &&
        typeof parsed.industryTerminology === "object"
          ? parsed.industryTerminology
          : {},
      synthesizedBrief: parsed.synthesizedBrief || "",
      researchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[research] Claude synthesis failed:", err);
    return buildBasicOutput(searches, input);
  }
}

/**
 * Estimated cost per research pipeline run in cents.
 * - Tavily: ~1 cent per advanced search x 4 queries = 4 cents
 * - Claude Sonnet: ~5 cents for synthesis (input + output tokens)
 */
export function estimateResearchCost(): {
  tavily: number;
  anthropic: number;
} {
  return { tavily: 4, anthropic: 5 };
}
