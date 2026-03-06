import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Dairy Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for dairy distributors. Restaurants, cafes, and food service accounts order milk, cheese, and dairy components online — delivery cutoffs, standing orders, and account-specific pricing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Dairy Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for dairy distributors. Delivery cutoffs enforced and standing orders automated for food service accounts. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/dairy-distributor" },
};

const config: IndustryConfig = {
  slug: "dairy-distributor",
  eyebrow: "For Dairy Distributors",
  h1Line1: "Your restaurant accounts order dairy every two days.",
  h1Line2: "Your driver shouldn't be the order taker.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for dairy distributors. Restaurants, cafes, and food service accounts order milk, cheese, butter, and dairy components online — with delivery cutoffs enforced automatically, standing orders for regular deliveries, and account-specific pricing. Live in under 2 weeks.",
  heroStat:
    "Dairy distributors averaging 3-4 deliveries per week per account spend 5+ hours weekly on phone orders that could be automated through a customer-facing ordering portal.",
  painPoints: [
    {
      before: "Restaurant accounts call or text your driver to modify tomorrow's milk and cream order — the driver relays the change by memory, the order gets fulfilled wrong, and the account is short on a Saturday service.",
      after: "Accounts place and modify orders in the portal before your cutoff. Drivers receive a finalized manifest — no relay, no memory, no modifications at the door. The order that ships is the order that was placed.",
    },
    {
      before: "Your cafe and bakery accounts order the same dairy components every delivery — whole milk, heavy cream, unsalted butter — and still call every time because there's no other way to confirm.",
      after: "Standing orders run automatically on each account's delivery schedule. Accounts get a confirmation 24 hours before and can adjust quantity in one tap. Your team doesn't touch a recurring order unless something changes.",
    },
    {
      before: "You offer one price to high-volume restaurant groups and another to smaller independent cafes — and when a manager calls and gets a different rep, the price varies and someone calls back to argue.",
      after: "Account-specific pricing is configured once and locked in the portal. Every account sees their agreed price every time, regardless of who they talk to — or whether they talk to anyone at all.",
    },
    {
      before: "Short-dated products — close-coded milk, marked-down specialty cheese — are communicated by phone and you can never reach all the right accounts before they sell to the first caller.",
      after: "Flash promotions for short-dated and limited stock items publish to targeted account segments in the portal. Accounts see the offer, claim their allocation, and order without a single phone call.",
    },
  ],
  features: [
    "Automated delivery cutoff enforcement with next available window displayed at checkout",
    "Standing order automation with 24-hour confirmation and quantity adjustment for recurring accounts",
    "Per-account pricing locked by account type — restaurant groups, independents, institutional",
    "Flash promotion builder for short-dated and limited-inventory dairy products",
    "Cold-chain handling and storage notes attached at the product level",
    "Net-30/60/90 billing with credit limits and overdue account alerts",
    "Branded wholesale account portal with your logo and domain",
    "Route-based fulfillment manifest for driver delivery coordination",
    "Minimum order quantity and delivery day restrictions per account and route",
    "Order history and one-click reorder for high-frequency food service accounts",
  ],
  testimonial: {
    quote:
      "Our drivers were basically order takers on the truck — scribbling changes on the manifest and relaying them back to the office. Orders were wrong, accounts were frustrated, and our drivers were spending time they didn't have on the phone instead of running their route. The portal shifted every order online before the truck rolls. Our error rate on dairy deliveries dropped immediately and our drivers actually have time to make their windows.",
    name: "Anthony B.",
    company: "Greenfield Dairy Distributors",
    industry: "Dairy Distribution",
  },
  sectionTitle: "What changes for dairy distributors.",
  featuresTitle: "Everything a dairy distributor needs.",
  stats: [
    {
      stat: "5+ hrs",
      label: "per week the average dairy distributor spends on phone and driver-relayed orders that a self-service portal would eliminate",
      source: "IDFA Distributor Operations Survey 2024",
    },
    {
      stat: "3-4x",
      label: "per week the typical restaurant or cafe account orders from their dairy distributor — high frequency that amplifies the cost of manual ordering",
      source: "Wholesail client data",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your restaurant and food service accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
