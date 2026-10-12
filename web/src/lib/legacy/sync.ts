import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { extractArticleBody } from './extract-body';
import { mapLegacyArticle, type MappedArticle } from './map';
import { parseCatalog, parseViews, type LegacyArticle } from './parse';

export type UpsertResult = 'inserted' | 'updated' | 'unchanged';

export interface ContentStore {
  upsertArticle(article: MappedArticle): Promise<UpsertResult>;
  mergeViews(articleId: string, count: number): Promise<boolean>;
  finishRun(input: {
    sourceCommit: string;
    articlesUpserted: number;
    viewsMerged: number;
  }): Promise<void>;
}

export interface SyncInput {
  articlesJson: unknown;
  draftsJson: unknown;
  views: Record<string, number>;
  readHtml: (slug: string) => string;
  sourceCommit: string;
  sourceHashesBefore: string[];
  sourceHashesAfter: () => string[];
}

export function hashText(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashFile(file: string): string {
  return hashText(readFileSync(file));
}

export async function syncLegacy(store: ContentStore, input: SyncInput): Promise<{
  articlesUpserted: number;
  viewsMerged: number;
}> {
  const before = input.sourceHashesBefore.join(',');
  const articles = parseCatalog(input.articlesJson, 'articles');
  const drafts = parseCatalog(input.draftsJson, 'drafts');
  let articlesUpserted = 0;

  for (const article of articles) {
    const result = await store.upsertArticle(toMapped(article, 'articles', input.readHtml));
    if (result !== 'unchanged') articlesUpserted += 1;
  }
  for (const article of drafts) {
    const result = await store.upsertArticle(toMapped(article, 'drafts', input.readHtml));
    if (result !== 'unchanged') articlesUpserted += 1;
  }

  const ids = new Map([...articles, ...drafts].map((article) => [article.slug, article.id]));
  let viewsMerged = 0;
  for (const [slug, count] of Object.entries(input.views)) {
    const id = ids.get(slug);
    if (!id) continue;
    if (await store.mergeViews(id, count)) viewsMerged += 1;
  }

  const after = input.sourceHashesAfter().join(',');
  if (before !== after) {
    throw new Error('La sincronización modificó archivos de la v2');
  }

  await store.finishRun({
    sourceCommit: input.sourceCommit,
    articlesUpserted,
    viewsMerged,
  });
  return { articlesUpserted, viewsMerged };
}

function toMapped(
  article: LegacyArticle,
  source: 'articles' | 'drafts',
  readHtml: (slug: string) => string,
): MappedArticle {
  return mapLegacyArticle(article, extractArticleBody(readHtml(article.slug), article.slug), source);
}
