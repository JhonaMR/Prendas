import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detectar puerto basado en variable de entorno o PM2 process name
function getVitePort() {
  const pmId = process.env.pm_id;
  const processName = process.env.pm_exec_path || '';

  // Si es entorno de desarrollo local
  if (process.env.NODE_ENV === 'development' && !pmId) {
    return 5175;
  }

  // Si es MELAS, usar puerto 5174
  if (pmId === '5' || processName.includes('melas')) {
    return 5174;
  }

  // Default a PLOW puerto 5173
  return 5173;
}

// Cargar certificados HTTPS
function getHttpsConfig() {
  const certPath = path.join(__dirname, 'backend/certs/server.crt');
  const keyPath = path.join(__dirname, 'backend/certs/server.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  }

  return false;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const vitePort = getVitePort();
  const httpsConfig = getHttpsConfig();

  return {
    server: {
      port: vitePort,
      host: '0.0.0.0',
      middlewareMode: false,
      https: httpsConfig as any,
      hmr: {
        host: 'localhost',
        port: vitePort,
        protocol: 'ws'
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: false,
        workbox: {
          maximumFileSizeToCacheInBytes: 10485760, // 10 MiB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutos
                }
              }
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 10000,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.BRAND_NAME': JSON.stringify(
        vitePort === 5174 ? 'Melas' : vitePort === 5175 ? 'Dev' : 'Plow'
      ),
      'import.meta.env.BRAND_SHORT': JSON.stringify(
        vitePort === 5174 ? 'melas' : vitePort === 5175 ? 'dev' : 'plow'
      ),
      'import.meta.env.BRAND_COLOR': JSON.stringify(
        vitePort === 5174 ? '#ef4444' : vitePort === 5175 ? '#8b5cf6' : '#3b82f6'
      ),
      'import.meta.env.BRAND_DESCRIPTION': JSON.stringify(
        vitePort === 5174 ? 'Sistema de Gestión - Melas' : vitePort === 5175 ? 'Sistema de Gestión - DEV' : 'Sistema de Gestión - Plow'
      )
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
