// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [sitemap()],
});
