import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { articles } from "@/lib/journal/articles"
import { ChevronLeft } from "lucide-react"

/** Strip dangerous HTML patterns as defense-in-depth for server-rendered content. */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://wholesailhub.com/journal/${article.slug}`,
      images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: `${article.title} — Wholesail Journal` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ['/Public Social Image.png'],
    },
    alternates: {
      canonical: `https://wholesailhub.com/journal/${article.slug}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Back link */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ChevronLeft className="h-4 w-4" />
          The Journal
        </Link>

        {/* Article header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs tracking-widest uppercase text-[#C8C0B4]">
              {article.category}
            </span>
            <span className="text-[#E5E1DB]">·</span>
            <span className="text-xs text-muted-foreground">{article.readTime}</span>
          </div>
          <h1 className="font-serif text-4xl font-normal leading-tight text-foreground mb-6">
            {article.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {article.description}
          </p>
          <div className="mt-6 text-xs text-[#C8C0B4]">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-12" />

        {/* Article body */}
        <div
          className="prose prose-neutral max-w-none
            prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-6
            prose-li:text-foreground/80
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-foreground prose-a:underline"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* CTA */}
        <div className="mt-16 border-t border-border pt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to source premium ingredients for your program?
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Browse the Catalog
          </Link>
        </div>
      </div>
    </div>
  )
}
