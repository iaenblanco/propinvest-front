import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ¡AÑADE ESTA LÍNEA!
  site: 'https://propinvest.cl', 
  
  integrations: [sitemap()]
});