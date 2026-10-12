import type { APIRoute } from 'astro';
import { getPublishedArticles } from '../lib/content/queries';

export const GET: APIRoute = () => {
  const index = getPublishedArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category.id,
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
