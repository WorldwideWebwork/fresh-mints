import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Pure TypeScript logic tests only: no Svelte or Tailwind plugins are needed.
// The `@` alias must stay in step with vite.config.ts and tsconfig.json paths.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
