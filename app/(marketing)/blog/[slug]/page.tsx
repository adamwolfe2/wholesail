import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import { getPostBySlug, getAllPosts, type BlogPost } from "@/lib/blog/posts";
import { EmailSubscribeForm } from "@/components/email-subscribe-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.seo.title,
      description: post.seo.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      siteName: "Wholesail",
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.title,
      description: post.seo.description,
    },
    alternates: {
      canonical: `https://wholesailhub.com/blog/${post.slug}`,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Strip dangerous HTML patterns as defense-in-depth for server-rendered content.
 * NOTE: Content is admin-controlled (sourced from lib/blog/posts, not user input).
 * If content ever becomes user-supplied, replace this with DOMPurify or similar
 * library-based sanitizer — regex-based HTML sanitization is inherently bypassable.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, "")
    .replace(/<details\b[^<]*(?:(?!<\/details>)<[^<]*)*<\/details>/gi, "")
    .replace(/\bon\w+\s*=/gi, "data-blocked=")
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}

function ArticleSchema({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo.description,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Wholesail",
      url: "https://wholesailhub.com",
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `https://wholesailhub.com/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://wholesailhub.com/blog/${post.slug}`,
    },
    keywords: post.seo.keywords.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Operations: { bg: "var(--blue-light)", text: "var(--blue)" },
  "Buying Guide": { bg: "#f0fdf4", text: "#16a34a" },
  Finance: { bg: "#fefce8", text: "#ca8a04" },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const others = allPosts
    .filter((p) => p.slug !== post.slug && p.category !== post.category)
    .slice(0, 2 - related.length);
  const relatedPosts = [...related, ...others].slice(0, 2);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <ArticleSchema post={post} />

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
            href="/blog"
            className="font-mono text-[13px] hidden sm:block link-body"
          >
            Blog
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-mono text-xs link-body"
            >
              <ArrowLeft className="w-3 h-3" />
              All articles
            </Link>
          </div>

          {/* Article header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className="font-mono text-[11px] font-semibold px-2.5 py-1"
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
                className="font-mono text-[11px] flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </span>
              <span
                className="font-mono text-[11px] flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock className="w-3 h-3" />
                {post.readTime} min read
              </span>
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-serif font-normal leading-[1.1] tracking-tight mb-5"
              style={{ color: "var(--text-headline)" }}
            >
              {post.title}
            </h1>

            <p
              className="font-mono text-sm leading-relaxed"
              style={{ color: "var(--text-body)", maxWidth: "680px" }}
            >
              {post.excerpt}
            </p>

            <div
              className="mt-6 pt-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                  style={{
                    backgroundColor: "var(--blue-light)",
                    color: "var(--blue)",
                  }}
                >
                  W
                </div>
                <div>
                  <div
                    className="font-mono text-xs font-semibold"
                    style={{ color: "var(--text-headline)" }}
                  >
                    {post.author.name}
                  </div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {post.author.title}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Article body */}
          <article
            className="prose prose-lg max-w-none mb-16"
            style={
              {
                "--tw-prose-body": "var(--text-body)",
                "--tw-prose-headings": "var(--text-headline)",
                "--tw-prose-lead": "var(--text-body)",
                "--tw-prose-links": "var(--blue)",
                "--tw-prose-bold": "var(--text-headline)",
                "--tw-prose-counters": "var(--text-muted)",
                "--tw-prose-bullets": "var(--blue)",
                "--tw-prose-hr": "var(--border)",
                "--tw-prose-quotes": "var(--text-body)",
                "--tw-prose-quote-borders": "var(--blue)",
                "--tw-prose-captions": "var(--text-muted)",
                "--tw-prose-code": "var(--text-headline)",
                "--tw-prose-pre-code": "var(--text-body)",
                "--tw-prose-pre-bg": "var(--bg-white)",
                "--tw-prose-th-borders": "var(--border)",
                "--tw-prose-td-borders": "var(--border)",
                fontFamily: "'Geist Mono', monospace",
                fontSize: "14px",
                lineHeight: "1.8",
              } as React.CSSProperties
            }
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          {/* CTA block styles injected via global CSS */}

          <div
            className="p-8 mb-16"
            style={{
              border: "1px solid var(--border-strong)",
              backgroundColor: "var(--bg-white)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div
                  className="font-mono text-xs uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Wholesail
                </div>
                <p
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "var(--text-body)", maxWidth: "480px" }}
                >
                  We build custom ordering portals for distribution companies.
                  Your clients order online. You manage everything from one
                  place. Live in under 2 weeks.
                </p>
              </div>
              <Link
                href="/#demo"
                className="shrink-0 inline-flex items-center gap-2 font-mono text-sm font-semibold btn-blue"
                style={{ padding: "12px 22px", borderRadius: "6px" }}
              >
                See the platform <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Newsletter capture */}
          <div className="mb-16">
            <EmailSubscribeForm source="blog-article" tagline="More insights like this, monthly." />
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2
                className="font-mono text-xs uppercase tracking-widest mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                More from the blog
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {relatedPosts.map((related, i) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="block group"
                  >
                    <article
                      className="p-6 h-full"
                      style={{
                        border: "1px solid var(--border)",
                        marginLeft: i > 0 ? "-1px" : undefined,
                        backgroundColor: "var(--bg-white)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="font-mono text-[10px] font-semibold px-2 py-0.5"
                          style={{
                            backgroundColor:
                              CATEGORY_STYLES[related.category]?.bg ??
                              "var(--blue-light)",
                            color:
                              CATEGORY_STYLES[related.category]?.text ??
                              "var(--blue)",
                            borderRadius: "4px",
                          }}
                        >
                          {related.category}
                        </span>
                        <span
                          className="font-mono text-[10px] flex items-center gap-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {related.readTime} min
                        </span>
                      </div>
                      <h3
                        className="text-base font-serif font-normal leading-snug mb-2 group-hover:underline decoration-1 underline-offset-4"
                        style={{ color: "var(--text-headline)" }}
                      >
                        {related.title}
                      </h3>
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
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-10"
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
            <Link href="/" className="font-mono text-xs link-body">
              Platform
            </Link>
            <Link href="/blog" className="font-mono text-xs link-body">
              Blog
            </Link>
            <Link href="/#intake-form" className="font-mono text-xs link-body">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
