import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { copyTree, hashFile } from '../scripts/copy-legacy-assets';
import { extractArticleBody } from '../src/lib/legacy/extract-body';
import { mapLegacyArticle } from '../src/lib/legacy/map';
import { repairMojibake } from '../src/lib/legacy/mojibake';
import { parseCatalog } from '../src/lib/legacy/parse';
import { syncLegacy, type ContentStore, type UpsertResult } from '../src/lib/legacy/sync';
import { findDestructiveSql } from '../src/lib/migrations';
import { renderHtaccess } from '../src/lib/htaccess';

const article = {
  id: 'abc123',
  title: 'Evangelion vuelve',
  slug: 'evangelion-vuelve',
  excerpt: 'Regresa la serie',
  content: '/blog/articulos/evangelion-vuelve',
  image: '/src/images/blog/evangelion.webp',
  category: 'anime' as const,
  categories: ['anime', 'ciencia ficciÃ³n'],
  tags: ['evangelion', 'ciencia ficciÃ³n', 'anime'],
  author: 'Humberto Marin',
  publishDate: '2026-02-26T17:33:00.000Z',
  modifiedDate: '2026-02-27T01:57:10.310Z',
  readTime: '5 min',
  featured: true,
  trending: false,
  status: 'published',
  metaDescription: '',
  metaKeywords: 'evangelion',
  canonicalUrl: '',
  ogImage: '',
  noIndex: false,
};

describe('mojibake', () => {
  it('repara latin1 y deja intacto el texto correcto', () => {
    expect(repairMojibake('ciencia ficciÃ³n')).toBe('ciencia ficción');
    expect(repairMojibake('ciencia ficción')).toBe('ciencia ficción');
  });
});

describe('cuerpo y mapeo', () => {
  it('exige .article-content y no importa un cuerpo vacío', () => {
    expect(() => extractArticleBody('<p>sin cuerpo</p>', 'x')).toThrow(/no tiene cuerpo/);
    expect(extractArticleBody('<div class="article-content"><p>Hola</p></div>', 'x')).toBe(
      '<p>Hola</p>',
    );
  });

  it('separa etiquetas de la categoría y convierte la lectura', () => {
    const mapped = mapLegacyArticle(article, '<p>Hola</p>', 'articles');
    expect(mapped.categoryId).toBe('anime');
    expect(mapped.tags.map((tag) => tag.name)).toEqual(['evangelion', 'ciencia ficción']);
    expect(mapped.readMinutes).toBe(5);
    expect(mapped.canonicalUrl).toBeNull();
    expect(mapped.status).toBe('PUBLISHED');
    expect(mapLegacyArticle({ ...article, status: 'draft' }, '<p>Hola</p>', 'drafts').status).toBe(
      'DRAFT',
    );
  });
});

describe('sincronización', () => {
  it('es idempotente y no toca los archivos de origen', async () => {
    const saved = new Map<string, string>();
    const store: ContentStore = {
      async upsertArticle(item): Promise<UpsertResult> {
        const key = JSON.stringify(item);
        if (saved.get(item.id) === key) return 'unchanged';
        const result = saved.has(item.id) ? 'updated' : 'inserted';
        saved.set(item.id, key);
        return result;
      },
      async mergeViews() {
        return false;
      },
      async finishRun() {},
    };
    const html = () => '<div class="article-content"><p>Hola</p></div>';
    const input = {
      articlesJson: { articles: [article] },
      draftsJson: { drafts: [] },
      views: {},
      readHtml: html,
      sourceCommit: 'abc',
      sourceHashesBefore: ['same'],
      sourceHashesAfter: () => ['same'],
    };
    expect((await syncLegacy(store, input)).articlesUpserted).toBe(1);
    expect((await syncLegacy(store, input)).articlesUpserted).toBe(0);
    await expect(
      syncLegacy(store, { ...input, sourceHashesAfter: () => ['changed'] }),
    ).rejects.toThrow(/modificó archivos/);
  });

  it('lee un artículo real de la v2 sin escribirlo', () => {
    const raw = JSON.parse(
      readFileSync(fileURLToPath(new URL('../../blog/data/articles.json', import.meta.url)), 'utf8'),
    );
    const [first] = parseCatalog(raw, 'articles');
    expect(first?.slug).toBeTruthy();
    const htmlPath = fileURLToPath(
      new URL(`../../blog/articulos/${first.slug}.html`, import.meta.url),
    );
    const before = hashFile(htmlPath);
    expect(extractArticleBody(readFileSync(htmlPath, 'utf8'), first.slug).length).toBeGreaterThan(20);
    expect(hashFile(htmlPath)).toBe(before);
  });
});

describe('guardia de migraciones', () => {
  it('rechaza SQL destructivo y acepta la migración inicial', () => {
    expect(findDestructiveSql('DROP TABLE articles;')).toContain('DROP');
    expect(findDestructiveSql('TRUNCATE articles;')).toContain('TRUNCATE');
    expect(findDestructiveSql('DELETE FROM articles;')).toContain('DELETE FROM');
    expect(findDestructiveSql('ALTER TABLE articles DROP COLUMN title;')).toContain(
      'ALTER TABLE ... DROP',
    );
    const init = readFileSync(
      new URL('../prisma/migrations/20261012120000_init/migration.sql', import.meta.url),
      'utf8',
    );
    expect(findDestructiveSql(init)).toEqual([]);
  });
});

describe('htaccess', () => {
  it('protege staging y bloquea la API de la v2', () => {
    const staging = renderHtaccess('staging');
    expect(staging).toContain('v3\\.salageek\\.com');
    expect(staging).toContain('[R=404,L]');
    expect(staging).toContain('X-Robots-Tag "noindex, nofollow"');
    expect(staging).toContain('save-article');
    expect(staging).toContain('^api/v3/_');
    expect(staging).not.toContain('hubspot');
    const production = renderHtaccess('production');
    expect(production).toContain('www');
    expect(production).not.toContain('v3\\.salageek\\.com');
  });
});

describe('copia de imágenes', () => {
  it('copia sin cambiar el archivo de origen', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'sg-assets-'));
    const source = path.join(dir, 'source.txt');
    writeFileSync(source, 'logo');
    const before = hashFile(source);
    copyTree(dir, path.join(dir, 'dest'), ['source.txt']);
    expect(readFileSync(path.join(dir, 'dest', 'source.txt'), 'utf8')).toBe('logo');
    expect(hashFile(source)).toBe(before);
  });
});
