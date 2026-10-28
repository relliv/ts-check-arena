// Finds checker versions worth benchmarking that the store does not have yet: per
// family, the newest version on the npm dist-tags the family follows, once it is
// older than the release age window.
import { spawnSync } from 'node:child_process';
import { families, inRange } from './checkers.ts';
import { listTools } from './store.ts';

const RELEASE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** The dist-tags followed per family; typescript's `beta` shows a release before it ships. */
const TAGS: Record<string, string[]> = {
  tsc: ['latest'],
  tsgo: ['latest', 'beta', 'rc'],
  tsrs: ['latest'],
  'tsc-rs': ['latest'],
  'tsc-ts': ['latest'],
  bun: ['latest'],
};

function npmView(pkg: string): { 'dist-tags': Record<string, string>; time: Record<string, string>; versions: string[] } {
  const r = spawnSync('npm', ['view', pkg, 'dist-tags', 'time', 'versions', '--json'], { encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`npm view ${pkg} failed: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

export function newVersions(now = Date.now()): string[] {
  const have = new Set(listTools().map(t => t.id));
  const found: string[] = [];
  const cache = new Map<string, ReturnType<typeof npmView>>();
  for (const family of families) {
    if (!cache.has(family.package)) cache.set(family.package, npmView(family.package));
    const info = cache.get(family.package)!;
    const candidates = new Set<string>();
    const latest = info['dist-tags']['latest'];
    for (const tag of TAGS[family.name] ?? ['latest']) {
      const version = info['dist-tags'][tag];
      // A prerelease tag left pointing at a version older than latest is stale.
      if (version && (tag === 'latest' || !latest || inRange(version, `>${latest.match(/^\d+(\.\d+)*/)?.[0] ?? '0'}`))) {
        candidates.add(version);
      }
    }
    // TypeScript 6 is no longer on a dist-tag: take the newest 6.x release.
    if (family.name === 'tsc') {
      const six = info.versions.filter(v => /^\d+\.\d+\.\d+$/.test(v) && inRange(v, family.versions)).at(-1);
      if (six) candidates.add(six);
    }
    for (const version of candidates) {
      const published = Date.parse(info.time[version] ?? '');
      const id = `${family.name}@${version}`;
      if (inRange(version, family.versions) && now - published >= RELEASE_AGE_MS && !have.has(id)) found.push(id);
    }
  }
  return found;
}
