// SAMPLE DATA — replace with client blog content
export interface Article {
  slug: string
  title: string
  description: string
  publishedAt: string
  readTime: string
  category: string
  content: string // HTML string
}

export const articles: Article[] = [
  {
    slug: 'white-truffle-season-guide',
    title: 'The White Truffle Season Guide: When to Buy, What to Expect',
    description:
      'White truffles have a narrow window — typically October through December. Here\'s how to source them at peak quality.',
    publishedAt: '2025-11-01',
    readTime: '6 min read',
    category: 'Truffles',
    content: `
<p>There are very few ingredients in the culinary world that arrive with as much anticipation — and as little margin for error — as the white truffle. <em>Tuber Magnatum Pico</em>, the Italian white truffle, is not farmed. It cannot be cultivated on demand. It grows where it grows, when it grows, and the window to experience it at its peak is brutally short.</p>

<h2>Peak Season: October Through December</h2>
<p>The white truffle season typically runs from early October through late December, with peak quality concentrated in the six weeks spanning mid-October to the end of November. During this window, the aroma — that singular combination of garlic, honey, aged cheese, and wet earth — is at its most intense and complex.</p>
<p>Outside this window, you'll encounter truffles, but they won't be the same. Early-season specimens can be firm and underdeveloped in flavor. Late-season truffles are often soft, prone to rapid deterioration, and significantly diminished in aroma. If you're building a menu feature around white truffle, this six-week core window is the only time to do it right.</p>

<h2>Regional Origins: Why Alba Is the Gold Standard</h2>
<p>White truffles are found across Italy, Croatia, Slovenia, and parts of France and Spain — but the most prized specimens come from the Langhe hills surrounding Alba in Piedmont, northern Italy. The combination of clay-rich soil, specific oak and hazelnut host trees, and the region's microclimate produces truffles with an aromatic complexity that is widely considered unmatched.</p>
<p>When sourcing, always ask your supplier for the origin. "Italian white truffle" is not sufficient — Alba-region truffles command and deserve a significant premium over specimens from elsewhere. Wholesail sources directly from trusted trifolau (truffle hunters) in the Piedmont region, with origin documentation on every shipment.</p>

<h2>What Affects Quality: Soil Moisture and Harvest Timing</h2>
<p>White truffle quality is almost entirely determined by conditions outside anyone's control. The primary drivers are:</p>
<ul>
  <li><strong>Rainfall in August and September.</strong> Adequate moisture in the two months before harvest season determines the size and aromatic development of the crop. Drought years produce smaller, less fragrant truffles at significantly higher market prices.</li>
  <li><strong>Harvest timing.</strong> A white truffle harvested even two to three days early can lack full aromatic development. A truffle harvested two to three days late begins degrading rapidly. The best hunters know their territories intimately and time accordingly.</li>
  <li><strong>Post-harvest handling.</strong> A truffle mishandled even once — exposed to moisture, excessive heat, or an unventilated environment — will lose a measurable portion of its aroma within hours.</li>
</ul>

<h2>Storage Upon Receipt</h2>
<p>White truffle storage is simple but unforgiving. Wrap each truffle individually in a dry paper towel, place in an airtight glass or ceramic container (never plastic), and store in the coldest part of your refrigerator — ideally 34–38°F. Change the paper towel daily; the truffle respires and the paper absorbs moisture that would accelerate decay. Stored properly, a high-quality white truffle will hold for five to seven days from receipt. Stored improperly, it can degrade meaningfully in 24 hours.</p>
<p>Do not store white truffles next to eggs or dairy unless you intend to infuse them — the aroma penetrates everything in proximity.</p>

<h2>Ordering Wholesale Through Wholesail</h2>
<p>Wholesail offers white truffles throughout the season on a weekly allocation basis. Southern California partners receive same-day delivery; nationwide orders ship overnight in cold-chain packaging with dry ice. Given the volatility of the crop, pricing fluctuates week to week based on Italian market conditions — contact your account manager for current rates and availability. We recommend establishing your weekly allocation early in the season before demand peaks in November.</p>

<h2>Service Guidance</h2>
<p>White truffle is always finished raw. Heat destroys the volatile aromatic compounds that make this ingredient worth its price. The truffle should be shaved — with a mandoline-style truffle shaver, not a knife — directly over a warm (not hot) dish at the last possible moment before it reaches the guest. Classic vessels: fresh tagliolini with butter, risotto bianco, scrambled eggs, fonduta. The dish should be simple enough that the truffle is the entire point. Never cook white truffle into a sauce or incorporate it during cooking — you will lose everything that makes it exceptional.</p>

<h2>Price Context</h2>
<p>White truffle market prices vary significantly by vintage and are set at the Alba truffle exchange each week of the season. In typical years, wholesale pricing runs in the range of several thousand dollars per kilogram — extraordinary drought years have pushed well above that. The best approach for restaurant programs is to plan menu pricing based on conservative yield assumptions and communicate with your supplier at the start of season to lock in allocation before prices peak.</p>
`,
  },
  {
    slug: 'caviar-grades-explained',
    title: 'Caviar Grades Explained: Kaluga, Osetra, and What the Numbers Mean',
    description:
      'Not all caviar is equal. Understanding grades, species, and harvest methods helps you source the right product for your program.',
    publishedAt: '2025-10-01',
    readTime: '5 min read',
    category: 'Caviar',
    content: `
<p>The caviar category has expanded dramatically since the CITES-driven collapse of wild Caspian fisheries in the 1990s and early 2000s. What was once a market defined by three species from one region now encompasses a global aquaculture industry producing wildly different products under the same broad label. Understanding species, grades, and quality indicators is prerequisite knowledge for anyone sourcing caviar for a serious program.</p>

<h2>The Major Species</h2>
<p>Not all caviar is equal — and species is the first variable that matters.</p>
<ul>
  <li><strong>Kaluga Hybrid (<em>Huso dauricus</em> × <em>Acipenser schrenckii</em>)</strong> — The workhorse of premium modern aquaculture. The Kaluga hybrid grows quickly relative to other sturgeons, producing large, firm beads with a clean, buttery flavor. It is frequently compared to Beluga in texture and bead size. This is Wholesail's primary caviar offering and the product we recommend for most restaurant programs.</li>
  <li><strong>Osetra (<em>Acipenser gueldenstaedtii</em>)</strong> — One of the three classic Caspian species, now farmed globally. Osetra produces medium-to-large beads with a notably complex, nutty flavor profile that distinguishes it from other species. Color ranges from olive-gold to dark grey-brown. Highly prized in fine dining for its expressive flavor.</li>
  <li><strong>Sevruga (<em>Acipenser stellatus</em>)</strong> — The smallest of the classic three, producing small, dark beads with an intensely briny, assertive flavor. Less common in the US market today but prized by traditionalists for its boldness.</li>
  <li><strong>Beluga (<em>Huso huso</em>)</strong> — The most legendary and legally restricted caviar in the world. Wild Beluga import into the United States is banned under CITES. Farmed Beluga is available in limited quantities from certified producers but commands extraordinary prices. The genuine article produces the largest beads of any sturgeon, with a famously delicate, almost creamy flavor.</li>
</ul>

<h2>What the Grade Numbers Mean</h2>
<p>Within each species, caviar is graded by bead size, with the grading convention running from 0 (smallest) to 000 (largest). A tin labeled <strong>000</strong> represents the largest, most visually impressive beads from that harvest — which is why 000 commands the highest price within a species. That said, smaller grades (0 or 00) are not inferior in flavor; many connoisseurs prefer the flavor concentration of a slightly smaller bead, and savvy operators find excellent value at the 0 and 00 levels.</p>

<h2>Color: Neither Gold Nor Dark Is Inherently Better</h2>
<p>Caviar color varies by species, diet, and individual fish and ranges from pale golden-champagne to deep charcoal black. Color preference is largely a matter of aesthetics and has no reliable correlation with flavor quality. The storied "golden" or "imperial" osetra can produce extraordinarily pale, golden-hued roe — which is rare and commands a premium — but a deep olive Osetra from a prime specimen is equally excellent. When evaluating caviar, focus on aroma (clean oceanic scent, never fishy or ammonia-like), bead integrity (firm, not mushy), and flavor rather than color alone.</p>

<h2>Salinity: Understanding Malossol</h2>
<p>The most important salinity designation in fine caviar is <strong>malossol</strong> — Russian for "little salt." Malossol caviar is salted at approximately 3–5% by weight, the minimum necessary for preservation while allowing the natural flavor of the roe to remain primary. This is the standard for all serious fine dining caviar. Products salted above this range are shelf-stable for longer but lack the clean, fresh flavor that defines premium caviar. Always verify malossol designation when sourcing.</p>

<h2>Storage and Service</h2>
<p>Caviar should be stored at 34–38°F — below the standard refrigerator temperature for most other foods. An unopened tin in proper cold storage has a shelf life of four to six weeks from packing date. Once opened, caviar should be consumed within 24–48 hours. Never freeze caviar; freezing ruptures the bead membrane and destroys the texture entirely.</p>
<p>For service, use non-reactive spoons — mother of pearl is traditional and optimal, but bone, horn, or high-quality plastic are acceptable. Metal spoons (silver, stainless) impart a metallic note that compromises the flavor of delicate caviar. Serve directly from the tin, nestled in crushed ice.</p>

<h2>Wholesail's Caviar Program</h2>
<p>Wholesail offers Kaluga 000 and Osetra as primary SKUs, with allocations of additional species available seasonally. All tins are sourced from certified aquaculture producers with full CITES documentation, cold-chain shipped to arrive fresh, and dated on receipt. Minimum order quantities and pricing are available through your account manager. We recommend establishing a standing weekly allocation for restaurant programs to ensure consistent supply.</p>
`,
  },
  {
    slug: 'cold-chain-matters',
    title: 'Why Cold Chain Is Everything in Specialty Food Distribution',
    description:
      'From harvest to your walk-in, temperature control determines whether premium ingredients arrive at their best or not at all.',
    publishedAt: '2025-09-01',
    readTime: '4 min read',
    category: 'Operations',
    content: `
<p>In the luxury ingredient business, there is no more important operational concept than cold chain integrity. It is, quite literally, the difference between product that delivers on its promise and product that does not — regardless of what the harvest or packing date says.</p>

<h2>What Cold Chain Means</h2>
<p>Cold chain refers to the unbroken sequence of temperature-controlled storage and transport that moves a perishable product from its point of origin to its point of use. The word "unbroken" is the operative one. A single gap — a truffle left on a receiving dock for two hours, a caviar tin that spent a flight in ambient cargo hold, a wagyu cut that warmed during a cross-country truck delay — can compromise or destroy the product's quality. The chain only works when it is never broken.</p>
<p>For standard food distribution, cold chain management is important. For the categories Wholesail handles, it is existential to the product.</p>

<h2>Why It's Critical for Our Categories</h2>
<ul>
  <li><strong>White Truffles.</strong> The volatile aromatic compounds that make white truffle worth its price are extremely sensitive to temperature. Above 45°F for extended periods, these compounds begin degrading. A truffle that warmed during transport may look identical to a perfect specimen but will deliver a fraction of the aroma it should. There is no way to recover it.</li>
  <li><strong>Caviar.</strong> The bead membrane of sturgeon roe is fragile. Temperature excursion — even brief warming — causes the membrane to weaken and the bead to collapse, turning firm, distinct pearls into a soft, undifferentiated mass. Flavor oxidizes rapidly above 40°F. Caviar exposed to temperature abuse may smell faintly sour or metallic on arrival; it should be rejected.</li>
  <li><strong>A5 Wagyu.</strong> The extreme marbling of A5 Wagyu is composed of intramuscular fat with a very low melting point. Temperature abuse doesn't produce visible spoilage rapidly, but it begins a slow enzymatic breakdown that affects both texture and flavor. More critically, partial warming and re-cooling creates condensation cycles that accelerate surface bacterial growth. Wagyu should arrive at 34–38°F and go directly to refrigeration or preparation.</li>
  <li><strong>Foie Gras.</strong> Fresh whole lobe foie gras is among the most perishable products in any kitchen. It operates on a very narrow temperature window (32–36°F) and has a shelf life measured in days, not weeks. Temperature excursion causes the lobes to express fat unevenly, making them difficult to work with and significantly reducing yield from any preparation.</li>
</ul>

<h2>What Happens When Cold Chain Breaks</h2>
<p>Temperature abuse produces predictable failures, though they manifest differently by category. For aromatics like truffle: irreversible loss of volatile compounds that cannot be detected visually. For caviar: bead collapse, accelerated oxidation, and off-flavors. For fresh protein (wagyu, foie gras): accelerated bacterial load, textural degradation, and shortened usable window. In all cases, the damage is done before you know it happened — which is why proactive cold chain management matters far more than reactive inspection.</p>

<h2>How Wholesail Manages Cold Chain</h2>
<p>Every product that leaves our network is packed with category-appropriate insulation and cooling media. Truffles ship in ventilated cold packs. Caviar ships in rigid insulated containers with gel ice. Wagyu and fresh proteins ship with dry ice at quantities calibrated to the transit time and expected ambient temperature of the delivery route. All perishable shipments include a temperature indicator that gives you a visual record of the thermal history from pack to delivery.</p>
<p>Southern California partners receive same-day delivery via our refrigerated vehicle network — no third-party carrier, no overnight ambient exposure. Nationwide partners receive 24–48 hour overnight cold-chain shipping, with delivery windows timed to avoid weekend carrier delays whenever possible.</p>

<h2>What You Should Check on Arrival</h2>
<p>Even with best-in-class cold chain management, verifying receipt condition is good practice and protects you if something went wrong in transit. When receiving specialty product, check:</p>
<ul>
  <li><strong>Packaging integrity.</strong> Is the insulated packaging intact? Is there evidence of damage, compression, or moisture infiltration?</li>
  <li><strong>Temperature.</strong> For caviar and wagyu, a probe thermometer on the product itself (not the ice) should read 34–40°F. Truffles should be cold to the touch. If anything feels warm, flag it immediately.</li>
  <li><strong>Aroma.</strong> Trust your nose. White truffles should smell immediately and powerfully aromatic. Caviar should smell clean and oceanic — any sour, sulfurous, or ammonia note is a red flag. Foie gras should smell clean and faintly lactic.</li>
  <li><strong>Visual integrity.</strong> Caviar beads should be distinct and firm when examined. Foie gras should be pale ivory to beige, uniform in color, with no dark spots or excessive expressed fat in the packaging.</li>
</ul>

<h2>Storing Each Category Correctly Upon Receipt</h2>
<p>Post-receipt storage is the final step in the cold chain and equally critical. White truffles: wrapped individually in dry paper towel, airtight container, 34–38°F, paper changed daily. Caviar: unopened tins at 34–38°F, consumed within 24–48 hours of opening. A5 Wagyu: 34–38°F, used within 3–5 days of delivery or frozen immediately if needed. Fresh foie gras: 32–36°F (coldest part of your walk-in), used within 3–4 days of delivery.</p>
<p>If you have questions about receipt condition on any Wholesail order, contact us immediately. We would rather resolve a concern on receipt than after service.</p>
`,
  },
  {
    slug: 'wagyu-grades-wholesale',
    title: 'A5 Wagyu for Restaurant Programs: Sourcing, Grades, and Yield',
    description:
      'A5 is the highest Japanese Wagyu grade — but within A5, there\'s still a spectrum. Here\'s what matters when sourcing for a restaurant program.',
    publishedAt: '2025-08-01',
    readTime: '7 min read',
    category: 'Wagyu & Protein',
    content: `
<p>A5 Wagyu has become one of the most recognizable luxury ingredient designations in American fine dining — and also one of the most misunderstood. The "A5" label tells you a great deal, but not everything. Understanding the full grading system, regional differences, and practical yield considerations is essential for building a program that delivers consistently and prices correctly.</p>

<h2>The Japanese Grading System</h2>
<p>Japanese Wagyu grading is administered by the Japan Meat Grading Association (JMGA) and involves two separate assessments combined into the two-character grade designation.</p>
<p>The <strong>letter grade (A, B, or C)</strong> represents yield — the percentage of usable meat relative to the carcass weight. A = 72% or above. B = 69–72%. C = below 69%. The yield grade has no bearing on flavor or marbling; it is a butchering efficiency metric. Most premium Japanese Wagyu earns an A grade.</p>
<p>The <strong>number grade (1–5)</strong> is the quality score, assessed across four criteria: marbling (BMS score), color and brightness, firmness and texture, and fat color and quality. A score of 5 represents the highest quality in all four categories. This is the grade that correlates with eating quality and price.</p>
<p><strong>A5, therefore, means the highest possible yield combined with the highest possible quality score.</strong> It is not a marketing term — it is a specific certification from a Japanese government-affiliated body that requires documentation at every step from farm to export.</p>

<h2>The Beef Marbling Standard (BMS) Explained</h2>
<p>Within the quality score, marbling is assessed on the Beef Marbling Standard (BMS) scale from 1 to 12. A quality score of 5 encompasses BMS 8 through 12 — a meaningful range. A BMS 8 steak is exceptional. A BMS 12 steak, with its extraordinary white-on-red marbling pattern, is something categorically different.</p>
<p>When sourcing A5 for a restaurant program, always ask for the BMS score, not just the A5 designation. BMS 8–9 is excellent for most menu applications and represents the more accessible end of the A5 price spectrum. BMS 10–12 is reserved for the most premium presentations, raw preparations, or tasting menu experiences where the ingredient is the centerpiece.</p>

<h2>Prefectural Differences</h2>
<p>Japan's different Wagyu-producing prefectures each have distinct breed genetics, feed programs, and aging protocols that produce meaningfully different flavor profiles under the same A5 designation.</p>
<ul>
  <li><strong>Miyazaki Prefecture.</strong> Miyazaki Wagyu is among the most consistent A5 programs in Japan, having won the national Wagyu Olympics (Zenkoku Wagyu Noryoku Kyoshinkai) multiple times. Known for its balance of fat sweetness and depth of beefy flavor. Widely considered the benchmark for restaurant programs.</li>
  <li><strong>Kagoshima Prefecture.</strong> Japan's largest volume A5 producer, with slightly lighter marbling on average than Miyazaki but excellent consistency at scale. Good value within the A5 tier for programs with higher volume requirements.</li>
  <li><strong>Hokkaido Prefecture.</strong> Produces Wagyu with distinctive richness from the colder climate — animals take longer to reach market weight, which some argue produces more developed flavor. Less common in the US market but worth seeking for differentiated menu features.</li>
  <li><strong>Kobe (Tajima Strain, Hyogo Prefecture).</strong> The most famous Wagyu designation globally — and the most protected. Authentic Kobe Beef carries specific documentation and meets extremely strict certification requirements. Many products marketed as "Kobe-style" in the US are not certified Kobe. If you are sourcing and selling certified Kobe, verify the documentation chain completely.</li>
</ul>

<h2>Japanese A5 vs. American Wagyu Crossbred: A Critical Distinction</h2>
<p>The US market contains both authentic Japanese A5 Wagyu (born, raised, slaughtered, and graded in Japan, then imported) and American-raised Wagyu crossbreeds (Fullblood American Wagyu or F1/F2 crosses with Angus). These are not the same product, and representing them interchangeably is misleading to guests and damaging to your program's credibility.</p>
<p>American Wagyu crossbreeds can be excellent beef — some American Fullblood programs produce impressive marbling — but they do not go through the JMGA grading system and are not certified A5. Price differences are significant: authentic Japanese A5 typically runs 3–6x the wholesale cost of a premium American Wagyu cross. When your menu says A5 Wagyu, guests assume Japanese certified. Ensure your sourcing matches the claim.</p>

<h2>Wholesale Yield Considerations</h2>
<p>A5 Wagyu's extraordinary fat content means restaurant operators must adjust their portion yield assumptions significantly. The intramuscular fat that produces BMS 10+ marbling also means the effective "meat" portion of a given cut weight is lower than a conventional prime steak. Additionally, A5 fat has a melting point well below body temperature, which means it renders very quickly on a hot cooking surface — affecting both visual presentation and the guest's sensation of satiety from a given portion.</p>
<p>The industry-standard guidance for A5 as a course: 3–4 ounces per guest is the appropriate portion for a single-course meat feature at a fine dining restaurant. This is not a concession — it is correct. The richness of properly prepared A5 makes a larger portion overwhelming. Pricing your program around 3–4oz per person allows you to deliver the authentic experience while maintaining margin at the elevated wholesale cost.</p>

<h2>Storage and Handling</h2>
<p>Refrigerate A5 Wagyu at 34–38°F and plan to use within 3–5 days of delivery for optimal quality. The product can be frozen, but freezing and thawing introduces moisture loss and some textural change — we recommend against freezing A5 if your program volume allows for weekly fresh ordering. For service, allow the meat to temper for 20–30 minutes before cooking. Cook quickly over very high heat — A5 responds to a hot surface, short contact time, and minimal seasoning. The Maillard crust and the rendered fat do the rest.</p>

<h2>Sourcing Through Wholesail</h2>
<p>Wholesail sources A5 Wagyu directly from certified Japanese export partners with full documentation by prefecture and BMS score. We offer weekly allocation windows for restaurant programs and can advise on cut selection based on your specific menu application. Contact your account manager to discuss current availability and pricing by BMS range.</p>
`,
  },
  {
    slug: 'foie-gras-sourcing-guide',
    title: 'Sourcing Foie Gras: Grade A, Terrine vs. Whole Lobe, and What to Ask Your Supplier',
    description:
      'Grade A foie gras from a reliable supplier means the difference between a showstopper dish and a broken terrine. Know what to look for.',
    publishedAt: '2025-07-01',
    readTime: '5 min read',
    category: 'Foie Gras & Duck',
    content: `
<p>Foie gras remains one of the most technically demanding luxury ingredients in a professional kitchen — not because the preparations are necessarily complex, but because the raw product is unforgiving. A Grade A lobe from a reliable source, handled correctly, will sear to a perfect golden crust, yield a clean torchon, and deliver the silky, rich flavor it promises. Compromised product, regardless of technique, will break, shrink, oxidize, or simply fail to deliver. Sourcing correctly is where the dish begins.</p>

<h2>Grade A vs. Grade B: Knowing What You're Buying</h2>
<p>Foie gras is graded primarily on the basis of lobe integrity, color uniformity, and absence of blemishes or blood infiltration.</p>
<p><strong>Grade A</strong> represents the top-tier whole lobes — large, firm but yielding, pale ivory to beige in color, with no visible blood spots and no green bile staining. These are the lobes for your seared preparations and torchon. The price premium is justified because yield is higher and the product behaves predictably in professional preparation. For any dish where the foie gras is the centerpiece of the plate, Grade A is non-negotiable.</p>
<p><strong>Grade B</strong> encompasses smaller lobes, irregularly shaped specimens, and those with minor color variation or small imperfections that don't affect flavor but reduce the aesthetic quality of a whole lobe presentation. Grade B is entirely appropriate for mousses, terrines, and compound preparations where the lobe will be puréed or incorporated into a larger preparation. Sourcing Grade B for these applications is economically sensible and produces no quality compromise in the final dish.</p>

<h2>Duck vs. Goose: Canard vs. Oie</h2>
<p>In the United States, the overwhelming majority of commercially available foie gras is duck (<em>canard</em>). Duck foie gras is produced primarily from Moulard ducks (a Muscovy-Pekin cross) and represents the standard for American restaurant programs. The flavor is rich, deeply savory, and slightly mineral — it responds beautifully to high-heat searing and cold preparations alike.</p>
<p>Goose foie gras (<em>oie</em>) is the French traditional standard — specifically associated with the Alsace and Périgord regions — and is rarer, richer, and more delicate in flavor. Goose lobes are typically larger, paler, and have a creamier, more subtly flavored fat. Outside of specific French-focused tasting menus, goose foie gras is difficult to source consistently in the US market and commands a significant premium. For most American restaurant programs, duck foie gras is both the practical and gastronomically sound choice.</p>

<h2>What to Inspect on Delivery</h2>
<p>Fresh whole lobe foie gras has a shelf life of approximately 3–4 days from receipt under proper storage conditions. Inspect every delivery carefully:</p>
<ul>
  <li><strong>Color.</strong> Grade A lobes should be pale ivory to light beige, uniform in tone. Dark spots, green tinges (bile staining), or deep red/purple bruising are defects that indicate damage or mishandling.</li>
  <li><strong>Texture.</strong> The lobe should be firm but yielding to moderate pressure — similar to pressing the base of your palm. A lobe that is rock-hard (too cold or over-chilled) or excessively soft and slippery (temperature-abused) is a concern.</li>
  <li><strong>Aroma.</strong> Fresh foie gras has a clean, faintly lactic, slightly sweet aroma. Any sour, ammonia, or overtly "livery" odor indicates product past its prime or improperly handled.</li>
  <li><strong>Fat expression.</strong> If a lobe is surrounded by excessive expressed fat in its packaging, it has likely experienced temperature abuse. Some fat expression is normal; a pool of rendered fat is not.</li>
</ul>

<h2>Storage: The Coldest Part of the Refrigerator</h2>
<p>Fresh foie gras should be stored at 32–36°F — the coldest end of your refrigerator's range, without actually freezing the product. In a commercial walk-in, this typically means the lowest shelf at the back, away from door and compressor cycles that create temperature fluctuations. Keep the lobe in its original vacuum packaging until ready to prep. Do not freeze fresh Grade A foie gras destined for searing or torchon — freezing changes the fat structure and significantly increases shrinkage during cooking.</p>

<h2>Preparation Notes for Service</h2>
<p>For <strong>seared foie gras</strong>: temper the lobe at room temperature for 20–30 minutes before portioning. Score lightly if desired. Use a very hot, dry pan (cast iron or carbon steel preferred — no added fat needed). 30–45 seconds per side is sufficient for a 3/4-inch slice. Rest briefly. The goal is a dark golden crust with a warm, barely set center. Overcooking turns a beautiful piece of foie gras into a pool of rendered fat.</p>
<p>For <strong>torchon</strong>: deveining is essential for a clean final product. The two main lobes are separated and the central vein network is removed by gently pulling under running cold water — do not tear the lobe. Season, cure, roll, poach, chill. The quality of your final torchon is almost entirely determined by the quality of the lobe you started with.</p>

<h2>Legal Context: California</h2>
<p>California law prohibits the sale of foie gras produced through force-feeding within the state — a prohibition that has been upheld by federal courts. Wholesail ships foie gras to all states except California. This is a sourcing consideration California-based operators need to be aware of. Our team can discuss compliant alternative preparations and products for California accounts.</p>

<h2>Ordering Through Wholesail</h2>
<p>Wholesail sources Grade A Moulard duck foie gras from certified producers with full traceability. We offer whole lobes and portioned options depending on program volume. Same-day delivery in Southern California (excluding California foie gras restrictions) and 24–48 hour overnight nationwide. Contact your account manager to discuss your weekly program requirements and pricing.</p>
`,
  },
]
