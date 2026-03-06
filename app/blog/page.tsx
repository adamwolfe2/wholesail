import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { EmailSubscribeForm } from "@/components/email-subscribe-form";

export const metadata: Metadata = {
  title: "Blog — Wholesail | Distribution Operations & Wholesale Ordering",
  description:
    "Practical guides for distribution company owners and operators. Wholesale ordering systems, billing, operations, and how to run a more efficient distribution business.",
  alternates: {
    canonical: "https://wholesailhub.com/blog",
  },
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Operations: { bg: "var(--blue-light)", text: "var(--blue)" },
  "Buying Guide": { bg: "#f0fdf4", text: "#16a34a" },
  Finance: { bg: "#fefce8", text: "#ca8a04" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Nav */}
      <nav
        className="px-4 sm:px-6 py-5 flex items-center justify-between sticky top-0 z-50 max-w-7xl mx-auto w-full"
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-lg tracking-[0.05em] font-bold"
          style={{ color: "var(--text-headline)" }}
        >
          WHOLESAIL
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/#demo"
            className="font-mono text-[13px] hidden sm:block link-body"
          >
            Platform
          </Link>
          <Link
            href="/#intake-form"
            className="font-mono text-[13px] font-semibold btn-blue"
            style={{ padding: "9px 20px", borderRadius: "6px" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <span
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Wholesail Blog
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-serif font-normal leading-tight mb-4"
            style={{ color: "var(--text-headline)" }}
          >
            Distribution operations,
            <br />
            <span className="italic">explained plainly.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            Practical guides for distribution company owners and operators. No
            buzzwords, no fluff — just what actually works.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="block mb-12 group"
          >
            <article
              className="p-8 md:p-10 transition-all"
              style={{
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="font-mono text-[11px] font-semibold px-2.5 py-1"
                  style={{
                    backgroundColor:
                      CATEGORY_STYLES[featured.category]?.bg ?? "var(--blue-light)",
                    color: CATEGORY_STYLES[featured.category]?.text ?? "var(--blue)",
                    borderRadius: "4px",
                  }}
                >
                  {featured.category}
                </span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(featured.publishedAt)}
                </span>
                <span
                  className="font-mono text-[11px] flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Clock className="w-3 h-3" />
                  {featured.readTime} min read
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl font-serif font-normal leading-snug mb-4 group-hover:underline decoration-1 underline-offset-4"
                style={{ color: "var(--text-headline)" }}
              >
                {featured.title}
              </h2>
              <p
                className="font-mono text-sm leading-relaxed mb-6 max-w-3xl"
                style={{ color: "var(--text-body)" }}
              >
                {featured.excerpt}
              </p>
              <span
                className="inline-flex items-center gap-2 font-mono text-sm font-semibold"
                style={{ color: "var(--blue)" }}
              >
                Read article <ArrowRight className="w-4 h-4" />
              </span>
            </article>
          </Link>
        )}

        {/* Newsletter capture */}
        <div className="mb-12">
          <EmailSubscribeForm source="blog" />
        </div>

        {/* Remaining posts grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <article
                  className="p-7 h-full transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    borderTop: i === 0 ? "1px solid var(--border)" : undefined,
                    marginTop: "-1px",
                    marginLeft: i % 3 !== 0 ? "-1px" : undefined,
                    backgroundColor: "var(--bg-white)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="font-mono text-[10px] font-semibold px-2 py-0.5"
                      style={{
                        backgroundColor:
                          CATEGORY_STYLES[post.category]?.bg ?? "var(--blue-light)",
                        color:
                          CATEGORY_STYLES[post.category]?.text ?? "var(--blue)",
                        borderRadius: "4px",
                      }}
                    >
                      {post.category}
                    </span>
                    <span
                      className="font-mono text-[10px] flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {post.readTime} min
                    </span>
                  </div>
                  <h2
                    className="text-lg font-serif font-normal leading-snug mb-3 group-hover:underline decoration-1 underline-offset-4"
                    style={{ color: "var(--text-headline)" }}
                  >
                    {post.title}
                  </h2>
                  <p
                    className="font-mono text-xs leading-relaxed mb-4"
                    style={{ color: "var(--text-body)" }}
                  >
                    {post.excerpt}
                  </p>
                  <span
                    className="font-mono text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: "var(--blue)" }}
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div
          className="mt-20 p-10 text-center"
          style={{
            border: "1px solid var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <h3
            className="text-2xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            Ready to stop managing orders by hand?
          </h3>
          <p
            className="font-mono text-sm mb-6 max-w-md mx-auto"
            style={{ color: "var(--text-body)" }}
          >
            See what a custom ordering portal looks like for your distribution
            business — live demo in 30 seconds.
          </p>
          <Link
            href="/#demo"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold btn-blue"
            style={{ padding: "12px 24px", borderRadius: "6px" }}
          >
            See the platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Simple footer */}
      <footer
        className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/"
            className="font-serif text-base font-bold tracking-widest"
            style={{ color: "var(--text-headline)" }}
          >
            WHOLESAIL
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-xs link-body"
            >
              Platform
            </Link>
            <Link
              href="/blog"
              className="font-mono text-xs link-body"
            >
              Blog
            </Link>
            <Link
              href="/#intake-form"
              className="font-mono text-xs link-body"
            >
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
