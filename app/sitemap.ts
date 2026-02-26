import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { articles } from '@/lib/journal/articles'
import { catalogCategories } from '@/lib/catalog-categories'
import { provenanceEntries } from '@/lib/provenance'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/partner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/drops`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/press`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/social`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/seasonal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic product catalog pages
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      where: { available: true },
      select: { slug: true, updatedAt: true },
    })
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/catalog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB unavailable during build — skip dynamic routes
  }

  // Journal articles — static, from lib/journal/articles.ts
  const journalRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/journal/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Category landing pages
  const categoryRoutes: MetadataRoute.Sitemap = catalogCategories.map(c => ({
    url: `${SITE_URL}/catalog/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Provenance pages — static editorial content
  const provenanceIndexRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/provenance`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]
  const provenanceRoutes: MetadataRoute.Sitemap = provenanceEntries.map(p => ({
    url: `${SITE_URL}/provenance/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // How to Order guide
  const guideRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...journalRoutes,
    ...productRoutes,
    ...provenanceIndexRoute,
    ...provenanceRoutes,
    ...guideRoute,
  ]
}
