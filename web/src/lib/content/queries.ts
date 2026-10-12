import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sanitizeBody } from './sanitize';
import type { ArticleSnapshot, ContentSnapshot } from './types';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export function snapshotPath(): string {
  if (process.env.CONTENT_SOURCE === 'fixtures') {
    return path.join(webRoot, 'tests', 'fixtures', 'snapshot.json');
  }
  return path.join(webRoot, '.content', 'snapshot.json');
}

export function loadSnapshot(): ContentSnapshot {
  const snapshot = JSON.parse(readFileSync(snapshotPath(), 'utf8')) as ContentSnapshot;
  return {
    ...snapshot,
    articles: snapshot.articles.map((article) => ({
      ...article,
      bodyHtml: sanitizeBody(article.bodyHtml),
    })),
  };
}

export function getPublishedArticles(snapshot = loadSnapshot()): ArticleSnapshot[] {
  return [...snapshot.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticleBySlug(slug: string, snapshot = loadSnapshot()): ArticleSnapshot | undefined {
  return getPublishedArticles(snapshot).find((article) => article.slug === slug);
}

export function getFeaturedArticles(limit = 3, snapshot = loadSnapshot()): ArticleSnapshot[] {
  const featured = getPublishedArticles(snapshot).filter((article) => article.featured);
  return (featured.length ? featured : getPublishedArticles(snapshot)).slice(0, limit);
}

export function getLatestArticles(limit: number, snapshot = loadSnapshot()): ArticleSnapshot[] {
  return getPublishedArticles(snapshot).slice(0, limit);
}

export function getRelatedArticles(
  article: ArticleSnapshot,
  limit = 3,
  snapshot = loadSnapshot(),
): ArticleSnapshot[] {
  return getPublishedArticles(snapshot)
    .filter((item) => item.category.id === article.category.id && item.slug !== article.slug)
    .slice(0, limit);
}

export function articlesByCategory(category: string, snapshot = loadSnapshot()): ArticleSnapshot[] {
  if (category === 'all') return getPublishedArticles(snapshot);
  return getPublishedArticles(snapshot).filter((article) => article.category.id === category);
}
