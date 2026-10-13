import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'web/**/*.test.{ts,tsx}', 'www/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
