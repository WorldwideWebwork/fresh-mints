import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vite';

const workspaceRoot = process.env.PNPM_WORKSPACE_DIR || path.resolve(__dirname, '../..');
const TARGET_DIST = path.join(workspaceRoot, 'wp-content/plugins/xophz-compass-freshmints/public/dist');

export default defineConfig(() => {
  return {
    plugins: [svelte(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['svelte'],
    },
    optimizeDeps: {
      exclude: ['lucide-svelte'],
    },
    server: {
      port: 8091,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: TARGET_DIST,
      emptyOutDir: true,
    },
  };
});
