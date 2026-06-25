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
        locales: { sq: 'sq-AL', en: 'en' },
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
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
    // Home
    '/home':                '/',
    '/en/home':             '/en',
  },
})
