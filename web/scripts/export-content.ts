import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { CATEGORIES } from '../src/lib/content/types';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const articles = await prisma.article.findMany({
  where: { status: 'PUBLISHED', deletedAt: null },
  include: { category: true, author: true, tags: { include: { tag: true } } },
  orderBy: { publishedAt: 'desc' },
});

const snapshot = {
  generatedAt: new Date().toISOString(),
  sourceCommit: process.env.SOURCE_COMMIT ?? null,
  categories: CATEGORIES,
  articles: articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    bodyHtml: article.bodyHtml,
    coverImage: article.coverImage,
    ogImage: article.ogImage,
    category: { id: article.category.id, name: article.category.name },
    author: { name: article.author.name, slug: article.author.slug },
    tags: article.tags.map((link) => ({ slug: link.tag.slug, name: link.tag.name })),
    featured: article.featured,
    trending: article.trending,
    readMinutes: article.readMinutes,
    metaDescription: article.metaDescription,
    metaKeywords: article.metaKeywords,
    canonicalUrl: article.canonicalUrl,
    noIndex: article.noIndex,
    publishedAt: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
    modifiedAt: article.modifiedAt?.toISOString() ?? null,
  })),
};

const target = path.join(webRoot, '.content');
mkdirSync(target, { recursive: true });
writeFileSync(path.join(target, 'snapshot.json'), JSON.stringify(snapshot));
await prisma.$disconnect();
console.log(`exportados ${snapshot.articles.length}`);
