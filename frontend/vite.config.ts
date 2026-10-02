import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'icon-192.png', 'icon-512.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html'
      },
      manifest: {
        name: 'Nimma Seva Token System',
        short_name: 'Nimma Seva',
        description: 'GramOne & Seva Sindhu Token Management System Shivamogga',
        theme_color: '#065f46',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Target modern browsers — smaller, faster output
    target: 'es2020',
    // Warn when a single chunk exceeds 500 kB (was ∞)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy:
         * - 'vendor-react'    → React runtime (cached aggressively; changes rarely)
         * - 'vendor-charts'   → Recharts (only loaded on Analytics page)
         * - 'vendor-ui'       → Lucide icons + all other third-party UI
         * - 'admin'           → All admin pages (protected; never loaded by citizens)
         * Page-level route chunks are created automatically via React.lazy()
         */
        manualChunks(id: string) {
          // React core
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          // Charting library (heavy; only Analytics page)
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Icon library + general UI dependencies
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/axios')) {
            return 'vendor-ui';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        ws: true
      }
    }
  }
});
