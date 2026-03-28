"use client";

import { FAQ } from "@/components/faq";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp } from "@/lib/animations";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does a portal build take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most portals are fully built and deployed within 10–14 business days from our first call. The intake form and consultation help us move fast — we already know your products, workflow, and feature needs before we start building.",
      },
    },
    {
      "@type": "Question",
      name: "What does the demo show?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The demo is a live version of the actual portal platform with sample data — not a mockup. When you enter your website, we scrape your logo and brand colors and apply them to the demo so you can see exactly what your clients will experience.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a portal build cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wholesail builds are high-ticket, white-glove engagements. Pricing depends on the features you need, number of product SKUs, integrations, and customization level. We scope everything on the consultation call and provide a clear investment estimate before you commit.",
      },
    },
    {
      "@type": "Question",
      name: "Do I own the code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely. Your portal is deployed to your own Vercel account, connected to your own database, Stripe account, and domain. You own everything. We also provide full documentation so your team (or any developer) can maintain and extend it.",
      },
    },
    {
      "@type": "Question",
      name: "Can my existing wholesale clients use this?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. The portal includes a client claim flow where existing clients can claim their account by verifying their email or phone number. We also support bulk client import from spreadsheets, and automated invitation emails. Most distributors onboard their first 10–20 clients within the first week.",
      },
    },
    {
      "@type": "Question",
      name: "How does text message ordering work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clients send a text with what they need. The system matches those items to your product catalog, sends back a confirmation with the order total, and the client replies YES to confirm. The order flows directly into your admin panel — no phone call required.",
      },
    },
  ],
};

export function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div ref={ref}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-10 text-center"
          >
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              Questions
            </span>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
              style={{ color: "var(--text-headline)" }}
            >
              Frequently asked questions.
            </h2>
          </motion.div>
          <FAQ />
        </div>
      </section>
    </>
  );
}
