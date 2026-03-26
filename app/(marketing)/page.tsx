import { NavBar } from "@/components/nav-bar";
import { HeroSection } from "@/components/homepage/hero-section";
import { StatsSection } from "@/components/homepage/stats-section";
import { BeforeAfterSection } from "@/components/homepage/before-after-section";
import { ErpAlternativeSection } from "@/components/homepage/erp-alternative-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { DemoSection } from "@/components/homepage/demo-section";
import { AmazonEffectSection } from "@/components/homepage/amazon-effect-section";
import { IndustriesSection } from "@/components/homepage/industries-section";
import { PainPointSection } from "@/components/homepage/pain-point-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { IncludedSection } from "@/components/homepage/included-section";
import { PricingSection } from "@/components/homepage/pricing-section";
import { GrowthSection } from "@/components/homepage/growth-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { AdditionalFeaturesSection } from "@/components/homepage/additional-features-section";
import { FaqSection } from "@/components/homepage/faq-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { IntakeSection } from "@/components/homepage/intake-section";
import { FooterSection } from "@/components/homepage/footer-section";

export default function WholesailPage() {
  return (
    <>
      <NavBar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6">
        <HeroSection />
        <StatsSection />
        <BeforeAfterSection />
        <ErpAlternativeSection />
        <TestimonialsSection />
        <DemoSection />
        <AmazonEffectSection />
        <IndustriesSection />
        <PainPointSection />
        <FeaturesSection />
        <IncludedSection />
        <PricingSection />
        <GrowthSection />
        <HowItWorksSection />
        <AdditionalFeaturesSection />
        <FaqSection />
        <CtaSection />
        <IntakeSection />
        <FooterSection />
      </main>
    </>
  );
}
