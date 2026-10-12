import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://salageek.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'preserve' },
  integrations: [preact()],
});
