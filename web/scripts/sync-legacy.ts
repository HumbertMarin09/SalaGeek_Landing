import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import type { MappedArticle } from '../src/lib/legacy/map';
import { hashFile, syncLegacy, type ContentStore, type UpsertResult } from '../src/lib/legacy/sync';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const legacyRoot = process.env.LEGACY_ROOT || repoRoot;
const dryRun = process.argv.includes('--dry-run');
const viewsArg = process.argv.indexOf('--views');
const viewsPath = viewsArg >= 0 ? process.argv[viewsArg + 1] : path.join(legacyRoot, 'blog', 'data', 'views.json');

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

function same(article: MappedArticle, current: {
  title: string; excerpt: string; bodyHtml: string; status: string; featured: boolean;
}): boolean {
  return current.title === article.title && current.excerpt === article.excerpt && current.bodyHtml === article.bodyHtml && current.status === article.status && current.featured === article.featured;
}

const store: ContentStore = {
  async upsertArticle(article): Promise<UpsertResult> {
    if (dryRun) return 'unchanged';
    const author = await prisma.author.upsert({
      where: { slug: article.authorSlug || 'sala-geek' },
      update: { name: article.authorName },
      create: { name: article.authorName, slug: article.authorSlug || 'sala-geek' },
    });
    const existing = await prisma.article.findUnique({ where: { id: article.id } });
    if (existing && same(article, existing)) return 'unchanged';
    await prisma.article.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        bodyHtml: article.bodyHtml,
        coverImage: article.coverImage,
        ogImage: article.ogImage,
        categoryId: article.categoryId,
        authorId: author.id,
        status: article.status,
        featured: article.featured,
        trending: article.trending,
        readMinutes: article.readMinutes,
        metaDescription: article.metaDescription,
        metaKeywords: article.metaKeywords,
        canonicalUrl: article.canonicalUrl,
        noIndex: article.noIndex,
        publishedAt: article.publishedAt,
        modifiedAt: article.modifiedAt,
        legacySource: article.legacySource,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        bodyHtml: article.bodyHtml,
        coverImage: article.coverImage,
        status: article.status,
        featured: article.featured,
        publishedAt: article.publishedAt,
        modifiedAt: article.modifiedAt,
      },
    });
    return existing ? 'updated' : 'inserted';
  },
  async mergeViews(articleId, count) {
    if (dryRun) return false;
    const current = await prisma.articleViews.findUnique({ where: { articleId } });
    const next = Math.max(current?.count ?? 0, count);
    if (current && current.count >= count) return false;
    await prisma.articleViews.upsert({
      where: { articleId },
      create: { articleId, count: next },
      update: { count: next },
    });
    return true;
  },
  async finishRun(input) {
    if (dryRun) return;
    await prisma.syncRun.create({
      data: {
        sourceCommit: input.sourceCommit.slice(0, 40),
        finishedAt: new Date(),
        articlesUpserted: input.articlesUpserted,
        viewsMerged: input.viewsMerged,
      },
    });
  },
};

const watched = [
  path.join(legacyRoot, 'blog', 'data', 'articles.json'),
  path.join(legacyRoot, 'blog', 'data', 'drafts.json'),
];
const hashes = () => watched.map(hashFile);
const result = await syncLegacy(store, {
  articlesJson: JSON.parse(readFileSync(watched[0], 'utf8')),
  draftsJson: JSON.parse(readFileSync(watched[1], 'utf8')),
  views: JSON.parse(readFileSync(viewsPath, 'utf8')),
  readHtml: (slug) => readFileSync(path.join(legacyRoot, 'blog', 'articulos', `${slug}.html`), 'utf8'),
  sourceCommit: process.env.SOURCE_COMMIT || 'local',
  sourceHashesBefore: hashes(),
  sourceHashesAfter: hashes,
});
console.log(JSON.stringify(result));
await prisma.$disconnect();
