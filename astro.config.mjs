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
  trailingSlash: 'never',
  redirects: {
    // Old top-level URLs → /kursi/*
    '/tabela':              '/kursi/tabela',
    '/historiku':           '/kursi/historiku',
    '/remitanca':           '/kursi/remitanca',
    '/en/tabela':           '/en/kursi/tabela',
    '/en/historiku':        '/en/kursi/historiku',
    '/en/remitanca':        '/en/kursi/remitanca',
    // /change/* → /kursi/*
    '/change':              '/kursi',
    '/change/tabela':       '/kursi/tabela',
    '/change/historiku':    '/kursi/historiku',
    '/change/remitanca':    '/kursi/remitanca',
    '/en/change':           '/en/kursi',
    '/en/change/tabela':    '/en/kursi/tabela',
    '/en/change/historiku': '/en/kursi/historiku',
    '/en/change/remitanca': '/en/kursi/remitanca',
    // IT / EL old change URLs → kursi
    '/it/change':              '/it/kursi',
    '/it/change/tabela':       '/it/kursi/tabela',
    '/it/change/historiku':    '/it/kursi/historiku',
    '/it/change/remitanca':    '/it/kursi/remitanca',
    '/el/change':              '/el/kursi',
    '/el/change/tabela':       '/el/kursi/tabela',
    '/el/change/historiku':    '/el/kursi/historiku',
    '/el/change/remitanca':    '/el/kursi/remitanca',
    // Home
    '/home':                '/',
    '/en/home':             '/en',
  },
})
