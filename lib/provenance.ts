export interface ProvenanceEntry {
  slug: string
  name: string
  origin: string
  heroTagline: string
  story: string[]
  qualityMarkers: string[]
  culinaryUses: string[]
  pairingNotes: string
  gradeExplainer?: string
  seasonNote?: string
  storageNote: string
}

export const provenanceEntries: ProvenanceEntry[] = [
  {
    slug: 'white-truffle',
    name: 'White Périgord Truffle',
    origin: 'Périgord, France & Alba, Italy',
    heroTagline: 'The most precious ingredient on earth — and we have it.',
    story: [
      "White truffles cannot be farmed. They grow only in symbiosis with the roots of oak and hazelnut trees, in a handful of regions across France and northern Italy, harvested by trained dogs in the cold months between November and February. No other ingredient inspires the same reverence in a professional kitchen.",
      "The white truffle — Tuber magnatum pico — is prized above all others for its haunting, complex aroma: a blend of garlic, honey, and earthiness that has no substitute. Perigord whites arrive from the oak forests of the Dordogne in peak condition, averaging 30-80 grams per piece.",
      "Wholesail sources directly from two generational truffle families. Every lot is graded by an experienced truffle sommelier before we accept it — we reject more than we approve. When you order from us, you're getting what we would serve at our own table."
    ],
    qualityMarkers: [
      "Firm exterior with minimal bruising or soft spots",
      "Intense, complex aroma — if you can't smell it through the bag, pass",
      "Clean cuts (lobing intact) indicate careful harvest",
      "Even coloration — pale cream to light ochre",
      "Minimum 20g to 25g per piece for usable yield"
    ],
    culinaryUses: [
      "Shaved raw over pasta, risotto, or scrambled eggs",
      "Infused into cream or butter to extend the aroma",
      "Finished over a carpaccio or beef tartare at tableside",
      "Folded into a delicate broth or consommé",
      "Combined with aged Parmigiano for maximum umami impact"
    ],
    pairingNotes: "White truffle's volatile aromatics pair best with wines of equal complexity — aged white Burgundy (Puligny-Montrachet, Meursault), white Rhône (Hermitage Blanc), or mature Barolo. Avoid tannic reds that will fight the perfume. On the cocktail side, a clean Champagne or grower Cava carries the scent beautifully.",
    seasonNote: "Peak season: November through late January. Order early — top-grade pieces sell out within 48 hours of arrival.",
    storageNote: "Store loosely wrapped in dry paper towels in an airtight container in the refrigerator. Replace paper daily. Use within 5-7 days of receipt. The aroma dissipates quickly — plan your menu accordingly."
  },
  {
    slug: 'black-truffle',
    name: 'Black Winter Truffle',
    origin: 'Périgord, France',
    heroTagline: 'The culinary workhorse of fine dining — intensely aromatic and endlessly versatile.',
    story: [
      "Tuber melanosporum — the Périgord black truffle — is the backbone of classical French cuisine. Paired with foie gras in Brillat-Savarin's era, featured in Escoffier, and still the ingredient that separates serious kitchens from the rest. We source directly from the Dordogne during the peak winter season.",
      "Unlike the white truffle's fleeting intensity, the black truffle holds up to gentle heat — making it extraordinary for cooked applications. Sauces, terrines, roasted proteins, and pasta all benefit from its deep, earthy, slightly chocolatey character.",
      "We grade every truffle ourselves. Extra-grade means pristine exterior, ideal size (30-100g), and maximum density. Premier-grade is excellent quality for cooked applications. We don't sell anything we wouldn't use."
    ],
    qualityMarkers: [
      "Dense and heavy for its size — lightness indicates dehydration",
      "Marbled black interior when cut (veining = aromatic compounds)",
      "Earthy, chocolate-cocoa aroma with no ammonia notes",
      "Firm, not spongy exterior",
      "Sourced December–February for maximum potency"
    ],
    culinaryUses: [
      "Classic truffle butter (compound butter for sauces and finishing)",
      "Under-skin roasted poultry — truffle chicken is iconic",
      "Duxelles as a filling for beef Wellington or terrines",
      "Grated fresh over warm pasta with cream and Parmigiano",
      "Infused oils and vinaigrettes for salads"
    ],
    pairingNotes: "Black truffle's earthiness pairs beautifully with the weight of Burgundy Pinot Noir, aged Pomerol, or a mature northern Rhône Syrah. For whites, try an aged Meursault or Pouilly-Fuissé. The black truffle is also extraordinary with aged Comté — a pairing that has stood the test of centuries.",
    seasonNote: "Prime season: December through March. Summer black truffles (June-August) are milder and better suited for cooked applications.",
    storageNote: "Same as white truffle: dry paper in airtight container, refrigerated. Black truffles hold slightly longer — 7-10 days — but deteriorate quickly once cut. Store with eggs to infuse them (a Wholesail team favorite)."
  },
  {
    slug: 'caviar',
    name: 'Sturgeon Caviar',
    origin: 'Multiple Aquaculture Origins',
    heroTagline: 'Sustainably farmed. Impeccably graded. The real thing.',
    story: [
      "Wild Caspian sturgeon is critically endangered — which is why every ounce of caviar Wholesail carries comes from carefully managed aquaculture programs. Our suppliers include the finest farms in China, Italy, France, and the United States, all certified by the Marine Stewardship Council.",
      "We carry Beluga, Osetra, Sevruga, and American White Sturgeon (Hackleback) — each with distinct flavor profiles. Our team has tasted caviar from over 40 farms worldwide. We carry maybe 8. The rest didn't make the cut.",
      "Caviar degrades with every day of exposure. We receive in small batches, store at -1°C to 2°C, and ship overnight on dry ice. Our clients receive product with a minimum 28-day shelf life on arrival."
    ],
    qualityMarkers: [
      "Firm, intact pearls that bounce back when pressed",
      "Clean brininess without fishy or ammonia notes",
      "Consistent pearl size (small variance = careful grading)",
      "No off-flavors — the best caviar needs only a mother-of-pearl spoon",
      "Malossol designation (lightly salted — under 5% salt)"
    ],
    culinaryUses: [
      "Served simply on a blini or potato chip with crème fraîche",
      "Atop an oyster or raw bar preparation",
      "As a sauce component in classic butter sauces (caviar beurre blanc)",
      "Garnish for egg preparations (scrambled eggs, deviled eggs, oeufs en gelée)",
      "As an amuse-bouche punctuation — one perfect spoonful"
    ],
    pairingNotes: "The canonical pairing is ice-cold Champagne — specifically grower Champagnes with high dosage and minimal oak. Blanc de blancs (Chablis producers) are extraordinary. Vodka is the traditional Russian choice — clean, well-made Russian Standard or Beluga. Avoid big oaky Chardonnays, anything sweet, or heavy reds.",
    gradeExplainer: "000 (three-zero) is the largest pearl size, typically Beluga. 00 is mid-size. 0 is smaller. Size affects mouthfeel and perceived luxury — but flavor is about species and farm, not pearl size.",
    seasonNote: "Available year-round. Osetra peaks October–March; Beluga is best in fall and winter.",
    storageNote: "Keep at -1°C to 2°C (not in the freezer). Once opened, consume within 3 days. Never expose to direct light or room temperature for more than 15 minutes."
  },
  {
    slug: 'wagyu',
    name: 'Japanese A5 Wagyu',
    origin: 'Kagoshima & Miyazaki Prefectures, Japan',
    heroTagline: 'The highest-graded beef on earth. Direct import from Japan.',
    story: [
      "A5 is the top grade assigned by the Japan Meat Grading Association — the intersection of Yield Grade A (maximum meat yield) and Quality Grade 5 (BMS 8-12, the finest marbling). Less than 1% of Japanese cattle reach this designation. We source exclusively from Kagoshima and Miyazaki prefectures, known for producing the most consistently exceptional animals.",
      "The fat in A5 Wagyu melts at 77°F — below body temperature. A single bite floods the palate with a rich, buttery intensity that coats and lingers in a way no other protein can. It's why Michelin chefs serve it in 2-3 ounce portions. More would be too much.",
      "Every cut arrives with a Japanese certificate of authenticity including the animal's tracking number, prefecture, and grade. We maintain cold chain custody from Japanese port to your kitchen."
    ],
    qualityMarkers: [
      "BMS (Beef Marbling Score) 9 or higher for A5 designation",
      "Milky-white intramuscular fat (yellow = grass-fed, inappropriate)",
      "Certificate of Authenticity with animal identification number",
      "Vacuum-sealed immediately post-cut",
      "Cut by Japanese prefectural butchers using traditional methods"
    ],
    culinaryUses: [
      "Thinly sliced shabu-shabu — one of the most elegant preparations",
      "Seared 30 seconds per side in cast iron — nothing more needed",
      "As a composed course: A5 with yuzu kosho and wasabi",
      "Tataki-style (briefly seared, sliced thin) with ponzu",
      "Wagyu tartare — the fat structure handles raw preparation beautifully"
    ],
    pairingNotes: "The richness of A5 Wagyu demands a wine that cuts through fat — aged Burgundy Pinot Noir (Gevrey-Chambertin, Vosne-Romanée), mature Barolo, or a structured Champagne. Japanese sake — especially junmai daiginjo — is the traditional and often superior pairing. Lighter and more food-friendly than you'd think.",
    seasonNote: "Available year-round. Prime holiday cuts (tenderloin, ribeye) should be ordered 2+ weeks ahead.",
    storageNote: "Refrigerate at 34-36°F. Best used within 5 days of receipt. Freeze only if absolutely necessary — freezing compromises the delicate fat structure. Thaw in refrigerator over 24 hours, never at room temperature."
  },
]

export function getProvenanceBySlug(slug: string): ProvenanceEntry | undefined {
  return provenanceEntries.find(p => p.slug === slug)
}
