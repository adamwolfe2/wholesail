import type { Metadata } from 'next'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'

export const revalidate = 86400 // ISR: rebuild at most once per day

export const metadata: Metadata = {
  title: 'How to Order — Wholesale Ordering Guide | Wholesail',
  description:
    'Everything you need to know about ordering from Wholesail — from applying for wholesale access to iMessage ordering, standing orders, cold-chain delivery, and payment terms.',
  openGraph: {
    title: 'How to Order — Wholesale Ordering Guide | Wholesail',
    description:
      'Everything you need to know about ordering from Wholesail — from applying for wholesale access to iMessage ordering, standing orders, cold-chain delivery, and payment terms.',
    type: 'article',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail — Luxury Wholesale Specialty Foods' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/guide',
  },
}

const faqItems = [
  {
    question: 'Is there a minimum order?',
    answer:
      'Yes — our standard minimum is $250 per order. This ensures cold-chain packaging is cost-effective for both parties. Some products (A5 Wagyu, fresh truffles) have per-product minimums noted in the catalog.',
  },
  {
    question: 'How often do you drop new products?',
    answer:
      'We run weekly drops on seasonal and limited items — new arrivals, seasonal products, and specialty finds. Sign up for drop alerts on the Drops page or follow @wholesailhub on Instagram.',
  },
  {
    question: 'Can you source something that isn\'t in the catalog?',
    answer:
      'Yes. Custom sourcing is one of our core services. Text us what you\'re looking for — we\'ll tell you if it\'s possible, timeline, and pricing within 24 hours. We source on request for both recurring and one-time needs.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'We ship to the continental US and Hawaii. International shipping is available for select shelf-stable products — contact us directly for a quote and compliance review. Fresh perishables (truffles, caviar) are domestic only.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Credit card (Visa, MC, Amex) via our secure checkout. ACH/wire transfer for orders over $2,000. Check by arrangement. NET-30 terms available for clients with 6+ months of account history.',
  },
  {
    question: 'What if something arrives damaged or below grade?',
    answer:
      'Contact us within 24 hours of delivery with a photo. We will replace, credit, or refund — no questions asked. Our cold chain protocol means damage is rare, but when it happens, we make it right immediately.',
  },
]

export default function GuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <MarketingHeader />

      {/* HERO */}
      <div className="pt-24 pb-12 sm:pb-16 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <p className="text-xs tracking-[0.25em] uppercase text-sand mb-4">Wholesail</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-normal text-ink leading-tight mb-6">
            How to Order
          </h1>
          <p className="text-lg text-ink/60 leading-relaxed max-w-2xl">
            We built this ordering system specifically for professional kitchens. Here&apos;s everything
            you need to know to get up and running — and keep running.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16 sm:py-20">
        <div className="space-y-20">

          {/* Section 1: Getting Started */}
          <section id="getting-started">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                01
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step One</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Getting Started</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                Wholesail is a wholesale-only operation. We work with Michelin-starred restaurants, four- and
                five-star hotels, private chefs, and qualified catering operations. We are not a consumer
                retailer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-shell">
                {[
                  {
                    step: '1',
                    title: 'Apply',
                    body: 'Submit the wholesale application. Takes 3 minutes. Tell us about your operation — restaurant name, volume, and what you\'re sourcing.',
                  },
                  {
                    step: '2',
                    title: 'Approval',
                    body: 'We review applications within 1 business day. Qualified applicants receive portal access and a welcome call from our team.',
                  },
                  {
                    step: '3',
                    title: 'Order',
                    body: 'Log in to your client portal or text us on iMessage. Your account, pricing, and order history are all in one place.',
                  },
                ].map((item) => (
                  <div key={item.step} className="bg-cream p-6 sm:p-8">
                    <p className="font-serif text-3xl font-bold text-shell mb-3 leading-none">{item.step}</p>
                    <h3 className="font-serif text-lg font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/partner"
                  className="inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  Apply for Wholesale Access
                </Link>
              </div>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 2: Browsing & Ordering */}
          <section id="browsing-ordering">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                02
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step Two</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Browsing & Ordering</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                Once you have portal access, your client dashboard shows your pricing tier, order history,
                available items, and any active promotions. The catalog is organized by category —
                review your catalog categories with your account manager after onboarding.
              </p>
              <ul className="space-y-3">
                {[
                  'Browse products and see your tier-specific pricing',
                  'Add items to cart — you can adjust quantities before checkout',
                  'Leave order notes for special instructions (sliced, whole, specific weights)',
                  'Review your order summary before submitting',
                  'Receive email confirmation with expected delivery window',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-ink/40 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-ink/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 3: Payment */}
          <section id="payment">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                03
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step Three</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Payment & Terms</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                We keep payment simple. No hidden fees, no surcharges, no confusion.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Credit Card',
                    body: 'Visa, Mastercard, and American Express accepted. Processed securely via Stripe at checkout. Instant confirmation.',
                  },
                  {
                    title: 'ACH / Wire Transfer',
                    body: 'Preferred for orders over $2,000. Wire details provided at checkout. Orders ship upon payment confirmation.',
                  },
                  {
                    title: 'Check',
                    body: 'Available by arrangement for established accounts. Contact us to set up check payment on your account.',
                  },
                  {
                    title: 'NET-30 Terms',
                    body: 'Available to qualified clients with 6+ months of order history. Apply through your account dashboard or contact us.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-shell bg-white p-5">
                    <h3 className="font-serif text-base font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 4: Delivery */}
          <section id="delivery">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                04
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step Four</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Delivery</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                Every perishable item ships in insulated, temperature-controlled packaging designed to
                maintain the cold chain from our warehouse to your kitchen. We never cut corners on
                packaging — the cost of spoilage is far higher than the cost of doing it right.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-shell">
                {[
                  {
                    zone: 'SoCal',
                    speed: 'Same-Day',
                    body: 'Los Angeles, Orange County, San Diego, and surrounding areas. Order by 10 AM for same-day delivery.',
                  },
                  {
                    zone: 'West Coast',
                    speed: 'Next Day',
                    body: 'San Francisco, Seattle, Portland, Las Vegas, and Phoenix. Overnight cold chain via FedEx Priority.',
                  },
                  {
                    zone: 'Nationwide',
                    speed: '24-48 Hours',
                    body: 'Continental US and Hawaii. FedEx overnight or 2-day depending on destination. Dry ice for caviar and proteins.',
                  },
                ].map((item) => (
                  <div key={item.zone} className="bg-cream p-6 sm:p-8">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-1">{item.zone}</p>
                    <p className="font-serif text-xl font-bold text-ink mb-3">{item.speed}</p>
                    <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 5: iMessage Ordering */}
          <section id="imessage">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                05
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step Five</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">iMessage Ordering</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                We built an AI ordering system that understands how buyers actually communicate. Text us
                naturally — &ldquo;12 cases product A, 5 lbs product B&rdquo; — and our system
                interprets your order, matches it to the catalog, and routes it to a human for
                confirmation before anything ships.
              </p>
              <div className="bg-ink p-6 sm:p-8 font-mono text-sm">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-[#1C6CF7] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-right">
                      I need 12 cases product A and 5 lbs product B for Friday
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white/80 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                      Got it. I see: 12x Product A and 5 lbs Product B (your usual).
                      Total calculated at checkout. Confirm for Friday delivery?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#1C6CF7] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                      Yes confirmed
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white/80 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                      Order confirmed. You&apos;ll receive a receipt by email and delivery Friday before noon.
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-ink/50">
                iMessage ordering is available to all active wholesale clients. The number is in your
                welcome email. A human reviews every AI-interpreted order before it ships.
              </p>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 6: Standing Orders */}
          <section id="standing-orders">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                06
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">Step Six</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Standing Orders</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-5">
              <p className="text-ink/70 text-base leading-relaxed">
                If your program runs on consistent volume, standing orders eliminate the overhead of
                placing the same order every week. Set it once — we handle the rest.
              </p>
              <ul className="space-y-3">
                {[
                  'Set a recurring order for any product on a weekly or bi-weekly cadence',
                  'Receive 48-hour advance notice before each shipment so you can adjust quantities',
                  'Skip a delivery with a single text or portal update',
                  'Standing order clients receive priority allocation on seasonal and limited items',
                  'Modify or cancel at any time — no penalties, no minimums',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-ink/40 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-ink/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-ink/50">
                Contact your account manager or text us to set up a standing order after your first
                purchase.
              </p>
            </div>
          </section>

          <div className="border-t border-shell" />

          {/* Section 7: FAQ */}
          <section id="faq">
            <div className="flex items-start gap-5 mb-8">
              <span className="font-serif text-5xl font-normal text-shell leading-none select-none shrink-0">
                07
              </span>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-2">FAQ</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink">Common Questions</h2>
              </div>
            </div>
            <div className="pl-0 sm:pl-20 space-y-0 divide-y divide-shell border-t border-shell">
              {faqItems.map((item) => (
                <div key={item.question} className="py-6">
                  <h3 className="font-serif text-lg font-bold text-ink mb-3">
                    {item.question}
                  </h3>
                  <p className="text-sm text-ink/65 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="border-t border-shell bg-ink py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="font-serif text-3xl sm:text-4xl font-normal text-white mb-4">
            Ready to get started?
          </p>
          <p className="text-white/50 text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Apply for wholesale access and join the kitchens that source with Wholesail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 text-sm font-medium tracking-wide hover:bg-white/90 transition-colors"
            >
              Apply for Wholesale Access
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 text-sm font-medium tracking-wide hover:border-white/50 transition-colors"
            >
              Browse the Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-shell bg-ink-dark text-cream py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-cream/40">
            <Link href="/catalog" className="hover:text-cream transition-colors">Catalog</Link>
            <Link href="/guide" className="hover:text-cream transition-colors">How to Order</Link>
            <Link href="/about" className="hover:text-cream transition-colors">About</Link>
            <Link href="/partner" className="hover:text-cream transition-colors">Wholesale</Link>
            <a
              href="https://www.instagram.com/wholesailhub/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream transition-colors flex items-center gap-1.5"
            >
              <Instagram className="h-3.5 w-3.5" />
              @wholesailhub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
