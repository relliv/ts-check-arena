import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// The site reads results/*/summary.json at build time. ARENA_SITE_PRIVATE=1 also
// shows results/private/ runs, for a local preview only: never deploy that build.
export default defineConfig({
  root: 'site',
  base: './',
  plugins: [tailwindcss()],
  define: {
    __ARENA_PRIVATE__: JSON.stringify(process.env['ARENA_SITE_PRIVATE'] === '1'),
  },
  server: { fs: { allow: ['..'] } },
  // ECharts, tree-shaken to the charts the site uses, is most of the bundle.
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 800 },
});
