// Checker families (checkers.json) and the tools built from them: one family at one
// exact version, such as tsgo@7.0.2. Everything a run needs to start a checker is
// resolved here: which package to install, where its native executable is, and
// which arguments select a config, plain output and a thread count.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { PLATFORM, ROOT, TOOLS_DIR } from './paths.ts';

export interface BinarySpec {
  package: string;
  file: string;
  /** The versions that publish this platform, when it was added after the first release. */
  versions?: string;
}

export interface Family {
  name: string;
  description: string;
  package: string;
  versions: string;
  runtime?: 'node';
  binary: Record<string, BinarySpec>;
  /** A plain string always applies; {args, versions} only within that range. */
  args: (string | { args: string[]; versions: string })[];
  project: string[];
  plainOutput: string[];
  listFiles: string[] | null;
  threads: { one: string[]; n: string[] } | null;
  /** As documented; a list when a release changed it, each entry for a version range. */
  defaultThreads: DefaultThreads | { versions: string; value: DefaultThreads }[];
  /**
   * Opt-in modes a checker documents, run as their own entry (tsrs@0.20.1+fast) so
   * the shipped default and the mode are both measured and compared.
   */
  variants?: Record<string, { args: string[]; versions?: string; description: string }>;
  source: string;
}

export type DefaultThreads = number | 'per-core';

export interface Tool {
  /** family@version, or family@version+variant: the name in results and charts. */
  id: string;
  /** family@version: the installed package, tools/<base>/, shared by its variants. */
  base: string;
  family: Family;
  version: string;
  variant?: string;
}

/** `default` runs a checker as it ships; a number sets that many checkers or threads. */
export type ThreadSetting = 'default' | number;

export const families: Family[] = (
  JSON.parse(readFileSync(join(ROOT, 'checkers.json'), 'utf8')) as { families: Family[] }
).families;

export function family(name: string): Family {
  const found = families.find(f => f.name === name);
  if (!found) {
    throw new Error(`unknown checker family "${name}"; known: ${families.map(f => f.name).join(', ')}`);
  }
  return found;
}

/** Leading numeric parts of a version: "7.1.0-dev.20261008.1" is [7, 1, 0]. */
function numericParts(version: string): number[] {
  return (version.match(/^\d+(\.\d+)*/)?.[0] ?? '').split('.').filter(Boolean).map(Number);
}

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * Semver precedence: numeric parts first, then a release above its prereleases,
 * then prerelease identifiers part by part (numbers numerically, words by text).
 * So 7.0.2 < 7.1.0-beta < 7.1.0-dev.20261027.1 < 7.1.0.
 */
export function compareVersions(a: string, b: string): number {
  const d = compare(numericParts(a), numericParts(b));
  if (d !== 0) return d;
  const pa = a.split('-').slice(1).join('-');
  const pb = b.split('-').slice(1).join('-');
  if (!pa || !pb) return pa ? -1 : pb ? 1 : 0;
  const xa = pa.split('.');
  const xb = pb.split('.');
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    const [ia, ib] = [xa[i], xb[i]];
    if (ia === undefined) return -1;
    if (ib === undefined) return 1;
    const na = /^\d+$/.test(ia);
    const nb = /^\d+$/.test(ib);
    const c = na && nb ? Number(ia) - Number(ib) : na ? -1 : nb ? 1 : ia.localeCompare(ib);
    if (c !== 0) return c;
  }
  return 0;
}

/**
 * Whether `version` is in a family's range: "*", or one comparison such as "<7" or
 * ">=1.4". Only the numeric prefix counts, so 7.1.0-dev.20261008.1 is >=7.
 */
export function inRange(version: string, range: string): boolean {
  if (range === '*') return true;
  const m = /^(>=|<=|>|<|=)?\s*(\d+(?:\.\d+)*)$/.exec(range.trim());
  if (!m) throw new Error(`unsupported version range "${range}"`);
  const d = compare(numericParts(version), numericParts(m[2]!));
  switch (m[1] ?? '=') {
    case '>=': return d >= 0;
    case '<=': return d <= 0;
    case '>': return d > 0;
    case '<': return d < 0;
    default: return d === 0;
  }
}

/**
 * Parses "tsgo@7.0.2", or "tsrs@0.20.1-ts7.1.0-beta+fast" for a declared variant,
 * and checks the version belongs to the family and the variant applies to it.
 */
export function parseTool(id: string): Tool {
  const at = id.lastIndexOf('@');
  if (at <= 0 || at === id.length - 1) {
    throw new Error(`"${id}" is not family@version, for example tsgo@7.0.2`);
  }
  const fam = family(id.slice(0, at));
  let version = id.slice(at + 1);
  let variant: string | undefined;
  const plus = version.lastIndexOf('+');
  if (plus > 0) {
    const name = version.slice(plus + 1);
    const declared = fam.variants?.[name];
    if (!declared) throw new Error(`"${id}": ${fam.name} has no variant "${name}" (known: ${Object.keys(fam.variants ?? {}).join(', ') || 'none'})`);
    version = version.slice(0, plus);
    if (declared.versions && !inRange(version, declared.versions)) {
      throw new Error(`"${id}": the ${name} variant needs ${fam.name} ${declared.versions}`);
    }
    variant = name;
  }
  if (!/^\d+\.\d+\.\d+[\w.+-]*$/.test(version)) {
    throw new Error(`"${id}": give an exact version, not a range or tag`);
  }
  if (!inRange(version, fam.versions)) {
    throw new Error(`${fam.package}@${version} is outside the ${fam.name} family (${fam.versions})`);
  }
  return { id, base: `${fam.name}@${version}`, family: fam, version, variant };
}

export const toolDir = (tool: Tool): string => join(TOOLS_DIR, tool.base);

/** The variants that apply to this tool's version, as full ids. */
export function variantIds(tool: Tool): string[] {
  return Object.entries(tool.family.variants ?? {})
    .filter(([, v]) => !v.versions || inRange(tool.version, v.versions))
    .map(([name]) => `${tool.base}+${name}`);
}

/** The documented thread count with no thread flag, for this tool's version. */
export function defaultThreads(tool: Tool): DefaultThreads | null {
  const d = tool.family.defaultThreads;
  if (!Array.isArray(d)) return d;
  return d.find(entry => inRange(tool.version, entry.versions))?.value ?? null;
}

/** The binary spec for this machine, or null when the checker publishes no build for it. */
export function binarySpec(tool: Tool, platform = PLATFORM): BinarySpec | null {
  const spec = tool.family.binary[platform] ?? tool.family.binary['*'] ?? null;
  return spec && (!spec.versions || inRange(tool.version, spec.versions)) ? spec : null;
}

export const availableOn = (tool: Tool, platform = PLATFORM): boolean => binarySpec(tool, platform) !== null;

/**
 * The executable's absolute path, or null when it is not installed. The platform
 * package is a dependency of the checker's package, not of tools/<id>/, so it is
 * resolved from the checker package's real location (pnpm keeps them side by side).
 */
export function binaryPath(tool: Tool): string | null {
  const spec = binarySpec(tool);
  if (!spec) return null;
  const main = join(toolDir(tool), 'node_modules', tool.family.package, 'package.json');
  if (!existsSync(main)) return null;
  try {
    const require = createRequire(realpathSync(main));
    const manifest = spec.package === tool.family.package ? realpathSync(main) : require.resolve(`${spec.package}/package.json`);
    const file = join(dirname(manifest), spec.file);
    return existsSync(file) ? file : null;
  } catch {
    return null;
  }
}

/** The installed version string from the checker package's own package.json. */
export function installedVersion(tool: Tool): string | null {
  const main = join(toolDir(tool), 'node_modules', tool.family.package, 'package.json');
  return existsSync(main) ? (JSON.parse(readFileSync(main, 'utf8')) as { version: string }).version : null;
}

/** The family's arguments that apply to this tool's version. */
export function familyArgs(tool: Tool): string[] {
  return tool.family.args.flatMap(a => (typeof a === 'string' ? [a] : inRange(tool.version, a.versions) ? a.args : []));
}

export function threadArgs(tool: Tool, threads: ThreadSetting): string[] | null {
  if (threads === 'default') return [];
  const flags = tool.family.threads;
  if (!flags) return null;
  const template = threads === 1 ? flags.one : flags.n;
  return template.map(a => a.replaceAll('{n}', String(threads)));
}

/**
 * The full argv for checking `config`: the executable (behind node for a JavaScript
 * checker), the family's arguments, the config, the thread flags and, when asked,
 * plain one-line output. Null when the tool cannot run with this thread setting.
 */
export function command(
  tool: Tool,
  config: string,
  options: { threads?: ThreadSetting; plain?: boolean; extra?: string[] } = {}
): string[] | null {
  const bin = binaryPath(tool);
  if (!bin) throw new Error(`${tool.id} is not installed; run pnpm arena tool add ${tool.id}`);
  const threads = threadArgs(tool, options.threads ?? 'default');
  if (threads === null) return null;
  return [
    ...(tool.family.runtime === 'node' ? [process.execPath, bin] : [bin]),
    ...familyArgs(tool),
    ...(tool.variant ? tool.family.variants![tool.variant]!.args : []),
    ...tool.family.project.map(a => a.replaceAll('{config}', config)),
    ...threads,
    ...(options.plain ? tool.family.plainOutput : []),
    ...(options.extra ?? []),
  ];
}
