import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Panel web (SPA). Konfiguracja czasu wykonania tylko z <meta> w web/index.html
// (bez import.meta.env w kodzie), żeby obraz podmieniał ją w HTML.
const frontendDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'web',
  envDir: frontendDir,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': {
        target: process.env.AUTH_PROXY_TARGET ?? 'http://localhost:4010',
        changeOrigin: false,
        xfwd: true,
      },
    },
  },
  preview: { port: 4173, strictPort: true },
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
  },
});
