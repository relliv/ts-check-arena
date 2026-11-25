// The tool store: one pnpm workspace package per checker version, tools/<id>/, all
// pinned by the one lockfile. Adding a tool writes its package.json and installs;
// removing deletes the folder and installs again so the lockfile drops it. Each
// family keeps its newest few versions: adding a newer one prunes the oldest, so
// runs stay short as releases pile up. Past runs keep their results.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Tool, compareVersions, parseTool, toolDir } from './checkers.ts';
import { ROOT, TOOLS_DIR } from './paths.ts';

/** Every tool with a folder under tools/, installed or not. */
export const KEEP_VERSIONS = 3;

export function listTools(): Tool[] {
  if (!existsSync(TOOLS_DIR)) return [];
  return readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.includes('@'))
    .map(d => parseTool(d.name))
    .sort((a, b) => a.family.name.localeCompare(b.family.name) || compareVersions(a.version, b.version));
}

export function toolManifest(tool: Tool): string {
  return `${JSON.stringify(
    {
      name: `tool-${tool.id.replace('@', '-')}`,
      version: '0.0.0',
      private: true,
      description: `${tool.family.description}, ${tool.family.package}@${tool.version}`,
      dependencies: { [tool.family.package]: tool.version },
    },
    null,
    2
  )}\n`;
}

/**
 * Adds an exact version to a list in pnpm-workspace.yaml: minimumReleaseAgeExclude
 * lets pnpm install it before it is 7 days old, trustPolicyExclude accepts a
 * reviewed trust downgrade. The file is part of the repository, so each exception
 * is reviewed like any other change.
 */
export function addPnpmException(
  key: 'minimumReleaseAgeExclude' | 'trustPolicyExclude',
  spec: string,
  file = join(ROOT, 'pnpm-workspace.yaml')
): boolean {
  const text = readFileSync(file, 'utf8');
  const entry = `  - ${spec}`;
  const header = new RegExp(`^${key}:\\n`, 'm');
  if (header.test(text) && text.split('\n').includes(entry)) return false;
  const anchor = key === 'minimumReleaseAgeExclude' ? /^(minimumReleaseAge:.*\n)/m : /^(trustPolicyIgnoreAfter:.*\n)/m;
  const next = header.test(text) ? text.replace(header, m => `${m}${entry}\n`) : text.replace(anchor, `$1${key}:\n${entry}\n`);
  writeFileSync(file, next);
  return true;
}

export function pnpmInstall(args: string[] = []): void {
  const r = spawnSync('pnpm', ['install', ...args], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`pnpm install failed (exit ${r.status})`);
}

export function addTools(
  ids: string[],
  options: { allowYoung?: boolean; allowTrustDowngrade?: boolean; install?: boolean; prune?: boolean } = {}
): { added: Tool[]; pruned: string[] } {
  const tools = ids.map(parseTool);
  for (const tool of tools) {
    mkdirSync(toolDir(tool), { recursive: true });
    writeFileSync(join(toolDir(tool), 'package.json'), toolManifest(tool));
    const spec = `${tool.family.package}@${tool.version}`;
    if (options.allowYoung) addPnpmException('minimumReleaseAgeExclude', spec);
    if (options.allowTrustDowngrade) addPnpmException('trustPolicyExclude', spec);
  }
  const pruned = options.prune === false ? [] : pruneTools();
  if (options.install !== false) pnpmInstall();
  return { added: tools, pruned };
}

/**
 * The tools past their family's keep count, oldest first. The newest versions always
 * stay, so the default reference (the newest tsgo) is never among them.
 */
export function toPrune(tools: Tool[]): Tool[] {
  const byFamily = new Map<string, Tool[]>();
  for (const t of tools) byFamily.set(t.family.name, [...(byFamily.get(t.family.name) ?? []), t]);
  return [...byFamily.values()].flatMap(list => {
    const keep = Math.max(1, list[0]!.family.keep ?? KEEP_VERSIONS);
    return [...list].sort((a, b) => compareVersions(a.version, b.version)).slice(0, Math.max(0, list.length - keep));
  });
}

/** Removes what toPrune names from tools/; returns their ids. The caller installs. */
export function pruneTools(): string[] {
  const old = toPrune(listTools());
  for (const tool of old) rmSync(toolDir(tool), { recursive: true, force: true });
  return old.map(t => t.id);
}

export function removeTools(ids: string[], options: { install?: boolean } = {}): void {
  for (const tool of ids.map(parseTool)) rmSync(toolDir(tool), { recursive: true, force: true });
  if (options.install !== false) pnpmInstall();
}
