import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const staging = process.env.PUBLIC_ENV === 'staging';
  const body = staging
    ? 'User-agent: *\nDisallow: /\n'
    : 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://salageek.com/sitemap.xml\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
