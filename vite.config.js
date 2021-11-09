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
})