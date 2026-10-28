import tailwindcss from '@tailwindcss/vite';
import { execFileSync } from 'node:child_process';
import { defineConfig, type Plugin } from 'vite';

// The site reads results/*/summary.json at build time, plus the runs CI committed
// to the data branch, read from git so `pnpm dev` shows them without a checkout.
// ARENA_SITE_PRIVATE=1 also shows results/private/ runs, for a local preview
// only: never deploy that build.
export default defineConfig({
  root: 'site',
  base: './',
  plugins: [tailwindcss(), dataBranch()],
  define: {
    __ARENA_PRIVATE__: JSON.stringify(process.env['ARENA_SITE_PRIVATE'] === '1'),
  },
  server: { fs: { allow: ['..'] } },
  // ECharts, tree-shaken to the charts the site uses, is most of the bundle.
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 800 },
});

const DATA_REF = 'refs/remotes/origin/data';

/** `virtual:arena-data`: every summary.json on the data branch, as a JSON array. */
function dataBranch(): Plugin {
  const id = 'virtual:arena-data';
  return {
    name: 'arena-data-branch',
    resolveId: source => (source === id ? `\0${id}` : null),
    load: source => (source === `\0${id}` ? `export default ${JSON.stringify(dataBranchRuns())};` : null),
  };
}

function dataBranchRuns(): unknown[] {
  const git = (...args: string[]): string =>
    execFileSync('git', args, { cwd: import.meta.dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000 });
  try {
    git('fetch', '--quiet', 'origin', `+refs/heads/data:${DATA_REF}`);
  } catch {
    // Offline, or no data branch yet: whatever was fetched last time still shows.
  }
  let dirs: string[];
  try {
    dirs = git('ls-tree', '--name-only', DATA_REF, 'results/').trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
  const runs: unknown[] = [];
  for (const dir of dirs) {
    try {
      runs.push(JSON.parse(git('show', `${DATA_REF}:${dir}/summary.json`)));
    } catch {
      // index.json, or a directory without a summary.
    }
  }
  return runs;
}
