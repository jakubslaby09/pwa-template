import { readdirSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
      host: true,
  },
  publicDir: './public',
  build: {
    target: 'es2021',
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: [
        resolve(__dirname, 'index.html'),
        ...readdirSync(
          resolve(__dirname, 'views')
        ).map(file => resolve(__dirname, 'views', file)),
      ]
    },
    assetsDir: 'bundle',
    assetsInlineLimit: 0,
  },
  plugins: [
    VitePWA({
      injectRegister: 'inline',
      mode: 'development',
      workbox: {
        globPatterns: [
          "**\/*.{js,css,html,wav,png,svg}"
        ]
      },
      manifest: {
        "name": "PWA Template",
        "start_url": "/",
        "display": "standalone",
        "icons": [
            {
              "src": "/icons/x48.png",
              "sizes": "48x48",
              "type": "image/png",
              "purpose": "maskable"
            },
            {
              "src": "/icons/x192.png",
              "sizes": "192x192",
              "type": "image/png",
              "purpose": "maskable"
            },
            {
              "src": "/icons/regular-x192.png",
              "sizes": "192x192",
              "type": "image/png",
              "purpose": "any"
            }
        ]
      },
    })
  ]
})