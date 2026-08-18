import { NavBar } from "@/components/nav-bar";
import { HeroSection } from "@/components/homepage/hero-section";
import { OfferSection } from "@/components/homepage/offer-section";
import { DemoSection } from "@/components/homepage/demo-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { PricingSection } from "@/components/homepage/pricing-section";
import { FaqSection } from "@/components/homepage/faq-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { IntakeSection } from "@/components/homepage/intake-section";
import { FooterSection } from "@/components/homepage/footer-section";
import { portalConfig } from "@/lib/portal-config";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: portalConfig.brandName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Custom-built B2B ordering portals and CRM for wholesale distribution companies. Branded client ordering, order and invoice management, and ongoing platform management as a service.",
  url: portalConfig.appUrl,
  offers: {
    "@type": "Offer",
    price: "25000",
    priceCurrency: "USD",
    description: "Custom portal build — one-time engagement",
  },
  provider: {
    "@type": "Organization",
    name: portalConfig.brandName,
    url: portalConfig.appUrl,
  },
};

export default function WholesailPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <BreadcrumbSchema items={[{ name: "Home" }]} />
      <NavBar />
      <main id="main-content" className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6">
        <HeroSection />
        <OfferSection />
        <DemoSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <IntakeSection />
        <FooterSection />
      </main>
    </>
  );
}
