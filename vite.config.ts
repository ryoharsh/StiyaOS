import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.js',
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
      preload: {
        input: 'electron/preload.js',
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
    }),
  ],
  server: {
    proxy: {
      '/api/rss': {
        target: 'https://feeds.bbci.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rss/, '')
      }
    }
  }
})
