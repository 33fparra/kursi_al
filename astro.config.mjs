import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://leku.al',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'sq',
        locales: { sq: 'sq-AL', en: 'en', it: 'it', el: 'el' },
      },
    }),
  ],
  output: 'static',
})
