import * as cheerio from 'cheerio';

export function extractArticleBody(html: string, slug: string): string {
  const $ = cheerio.load(html);
  const body = $('.article-content').first().html()?.trim() ?? '';
  if (!body) {
    throw new Error(`El artículo ${slug} no tiene cuerpo en .article-content`);
  }
  return body;
}
