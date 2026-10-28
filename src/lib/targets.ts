// Which configs of a target are checked.
//
//   list   the configs given with --configs or --configs-file, relative to the target
//   nx     every Nx project with a typecheck target: its tsconfig.lib.json, else
//          tsconfig.app.json, else tsconfig.json (the project graph comes from nx)
//   root   the target's own tsconfig.json
//   auto   nx when the target has nx.json, otherwise root
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

export type Discovery = 'auto' | 'nx' | 'root' | 'list';

const CONFIG_PREFERENCE = ['tsconfig.lib.json', 'tsconfig.app.json', 'tsconfig.json'];

interface NxGraph {
  graph: { nodes: Record<string, { data: { root: string; targets?: Record<string, unknown> } }> };
}

export function nxConfigs(target: string): string[] {
  const nx = join(target, 'node_modules', '.bin', process.platform === 'win32' ? 'nx.cmd' : 'nx');
  if (!existsSync(nx)) throw new Error('nx discovery: no node_modules/.bin/nx in the target; install its dependencies first');
  const dir = mkdtempSync(join(tmpdir(), 'arena-nx-'));
  try {
    const file = join(dir, 'graph.json');
    const r = spawnSync(nx, ['graph', `--file=${file}`], {
      cwd: target,
      encoding: 'utf8',
      env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
      shell: process.platform === 'win32',
    });
    if (r.status !== 0 || !existsSync(file)) throw new Error(`nx graph failed: ${(r.stderr || r.stdout).slice(-400)}`);
    const graph = JSON.parse(readFileSync(file, 'utf8')) as NxGraph;
    return Object.values(graph.graph.nodes)
      .filter(n => n.data.targets && 'typecheck' in n.data.targets)
      .map(n => CONFIG_PREFERENCE.map(c => join(n.data.root, c)).find(c => existsSync(join(target, c))))
      .filter((c): c is string => c !== undefined)
      .map(c => c.replaceAll('\\', '/'))
      .sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function discoverConfigs(target: string, mode: Discovery, list: string[] = []): { mode: Discovery; configs: string[] } {
  if (list.length > 0 || mode === 'list') {
    for (const c of list) if (!existsSync(resolve(target, c))) throw new Error(`config not found in the target: ${c}`);
    return { mode: 'list', configs: list.map(c => relative(target, resolve(target, c)).replaceAll('\\', '/')) };
  }
  const resolved = mode === 'auto' ? (existsSync(join(target, 'nx.json')) ? 'nx' : 'root') : mode;
  if (resolved === 'nx') return { mode: 'nx', configs: nxConfigs(target) };
  if (!existsSync(join(target, 'tsconfig.json'))) throw new Error('the target has no tsconfig.json; pass --configs');
  return { mode: 'root', configs: ['tsconfig.json'] };
}

export function readConfigList(file: string): string[] {
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

/** The target's commit and whether it has local changes, when it is a git checkout. */
export function targetRevision(target: string): { commit: string | null; dirty: boolean | null } {
  const git = (args: string[]) => spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  const head = git(['rev-parse', 'HEAD']);
  if (head.status !== 0) return { commit: null, dirty: null };
  return { commit: head.stdout.trim(), dirty: git(['status', '--porcelain', '--untracked-files=no']).stdout.trim() !== '' };
}
