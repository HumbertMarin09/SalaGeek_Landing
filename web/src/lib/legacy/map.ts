import { repairMojibake } from './mojibake';
import type { CategoryId, LegacyArticle } from './parse';

export interface MappedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  coverImage: string | null;
  ogImage: string | null;
  categoryId: CategoryId;
  authorName: string;
  authorSlug: string;
  tags: { slug: string; name: string }[];
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  trending: boolean;
  readMinutes: number;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  publishedAt: Date | null;
  modifiedAt: Date | null;
  legacySource: string;
}

function slugify(value: string): string {
  return repairMojibake(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function emptyToNull(value: string | null | undefined): string | null {
  const repaired = repairMojibake(value ?? '').trim();
  return repaired ? repaired : null;
}

export function mapLegacyArticle(
  article: LegacyArticle,
  bodyHtml: string,
  source: 'articles' | 'drafts',
): MappedArticle {
  const minutes = Number.parseInt(article.readTime ?? '', 10);
  const categoryTag = article.category;
  const tags = article.tags
    .map((tag) => repairMojibake(tag).trim())
    .filter((tag) => tag && slugify(tag) !== categoryTag)
    .map((name) => ({ name, slug: slugify(name) }))
    .filter((tag) => tag.slug);

  return {
    id: article.id,
    slug: article.slug,
    title: repairMojibake(article.title).slice(0, 200),
    excerpt: repairMojibake(article.excerpt),
    bodyHtml,
    coverImage: emptyToNull(article.image),
    ogImage: emptyToNull(article.ogImage) ?? emptyToNull(article.image),
    categoryId: article.category,
    authorName: repairMojibake(article.author).slice(0, 80),
    authorSlug: slugify(article.author),
    tags,
    status: source === 'drafts' || article.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
    featured: article.featured,
    trending: article.trending,
    readMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 1,
    metaDescription: emptyToNull(article.metaDescription),
    metaKeywords: emptyToNull(article.metaKeywords),
    canonicalUrl: emptyToNull(article.canonicalUrl),
    noIndex: article.noIndex,
    publishedAt: article.publishDate ? new Date(article.publishDate) : null,
    modifiedAt: article.modifiedDate ? new Date(article.modifiedDate) : null,
    legacySource: source,
  };
}
