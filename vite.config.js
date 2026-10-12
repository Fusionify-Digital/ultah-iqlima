import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Link previews (WhatsApp, IG, etc.) need an absolute image URL. Vercel exposes the
// production domain at build time; SITE_URL can override it (e.g. a custom domain).
function siteUrl() {
  const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL } = process.env
  if (SITE_URL) return SITE_URL.replace(/\/$/, '')
  const host = VERCEL_PROJECT_PRODUCTION_URL || VERCEL_URL
  return host ? `https://${host}` : ''
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl()),
    },
  ],
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
