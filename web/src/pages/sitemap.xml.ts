import type { APIRoute } from 'astro';
import { CANONICAL_ORIGIN } from '../lib/content/format';
import { getPublishedArticles } from '../lib/content/queries';

export const GET: APIRoute = () => {
  const urls = ['/', '/blog/', '/media-kit', '/privacidad', '/terminos', '/cookies', ...getPublishedArticles().map((article) => `/blog/articulos/${article.slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${CANONICAL_ORIGIN}${url}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
