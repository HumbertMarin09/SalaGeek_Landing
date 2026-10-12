import { z } from 'zod';

export const CATEGORY_IDS = ['peliculas', 'series', 'anime', 'gaming', 'tecnologia'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

const legacyArticleSchema = z.object({
  id: z.string().min(1).max(32),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/),
  excerpt: z.string().default(''),
  content: z.string().default(''),
  image: z.string().nullable().optional(),
  category: z.enum(CATEGORY_IDS),
  categories: z.array(z.string()).default([]),
  categoryDisplay: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  publishDate: z.string().nullable().optional(),
  modifiedDate: z.string().nullable().optional(),
  readTime: z.string().optional(),
  wordCount: z.number().optional(),
  views: z.number().optional(),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  status: z.string().default('published'),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
});

export type LegacyArticle = z.infer<typeof legacyArticleSchema>;

export const catalogSchema = z.object({
  articles: z.array(legacyArticleSchema).optional(),
  drafts: z.array(legacyArticleSchema).optional(),
});

export function parseCatalog(raw: unknown, source: string): LegacyArticle[] {
  const parsed = catalogSchema.parse(raw);
  return parsed.articles ?? parsed.drafts ?? [];
}

export function parseViews(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('views.json debe ser un objeto de slug a número');
  }
  const views: Record<string, number> = {};
  for (const [slug, count] of Object.entries(raw)) {
    if (typeof count !== 'number' || !Number.isFinite(count)) {
      throw new Error(`La vista de ${slug} no es un número`);
    }
    views[slug] = count;
  }
  return views;
}

export function sourceLabel(source: string): string {
  return source;
}
