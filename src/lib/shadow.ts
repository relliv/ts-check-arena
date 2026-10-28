// Shadow configs: how a project that TypeScript 7 refuses to read still gets checked.
//
// TypeScript 7 removed options many projects still set (baseUrl, moduleResolution
// node10 and classic, esModuleInterop false). A shadow config extends the project's
// own config and overrides only those, so every checker, TypeScript 6 included,
// checks the same program. The project's files are never edited.
//
// Shadows are written inside the target, in .ts-check-arena/, because TypeScript
// resolves `types` entries from the config's directory upward: from a folder outside
// the project no node_modules would be in reach. The folder ignores itself through
// its own .gitignore and is removed after the run.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import ts from 'typescript';

const MODULE_RESOLUTIONS_REMOVED = new Set(['node', 'node10', 'classic']);
const MODULES_BUNDLER_ACCEPTS = new Set(['es2015', 'es2020', 'es2022', 'esnext', 'preserve']);

/**
 * The compiler option overrides that make `config` readable by TypeScript 7, read
 * through the TypeScript 6 API so an option set anywhere in the extends chain is
 * seen. Empty when the config needs none. Throws when TypeScript 6 itself reports
 * an error in the config.
 */
export function shadowOverrides(config: string, root: string): Record<string, unknown> {
  const parsed = ts.getParsedCommandLineOfConfigFile(config, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: diagnostic => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  if (!parsed) throw new Error(`cannot read ${config}`);
  const configError = parsed.errors.find(e => e.category === ts.DiagnosticCategory.Error && e.code !== 18003);
  if (configError) throw new Error(ts.flattenDiagnosticMessageText(configError.messageText, ' '));

  const options = parsed.options;
  const overrides: Record<string, unknown> = {};

  if (options.baseUrl !== undefined) overrides['baseUrl'] = null;
  if (options.esModuleInterop === false) overrides['esModuleInterop'] = null;
  if (options.allowSyntheticDefaultImports === false) overrides['allowSyntheticDefaultImports'] = null;

  const resolution =
    options.moduleResolution === undefined ? undefined : String(ts.ModuleResolutionKind[options.moduleResolution]).toLowerCase();
  if (resolution !== undefined && MODULE_RESOLUTIONS_REMOVED.has(resolution)) {
    overrides['moduleResolution'] = 'bundler';
    const module = options.module === undefined ? undefined : String(ts.ModuleKind[options.module]).toLowerCase();
    if (module === undefined || !MODULES_BUNDLER_ACCEPTS.has(module)) overrides['module'] = 'esnext';
  }

  // TypeScript 7 resolves a `types` entry only inside `typeRoots` once they are set,
  // with no node_modules fallback. With `types` explicit, adding the node_modules
  // folders as roots includes nothing extra; the `*` wildcard would turn every
  // package into a type root, so it is left alone.
  if (options.types && options.types.length > 0 && !options.types.includes('*') && options.typeRoots) {
    const roots = [...options.typeRoots];
    for (let dir = dirname(config); ; dir = dirname(dir)) {
      const modules = join(dir, 'node_modules');
      if (existsSync(modules) && !roots.includes(modules)) roots.push(modules);
      if (dir === root || dir === dirname(dir)) break;
    }
    if (roots.length > options.typeRoots.length) overrides['typeRoots'] = roots;
  }

  // Without baseUrl, TypeScript 7 accepts only relative or absolute `paths` targets.
  if (options.paths && overrides['baseUrl'] === null) {
    const base = (options['pathsBasePath'] as string | undefined) ?? options.baseUrl ?? dirname(config);
    overrides['paths'] = Object.fromEntries(
      Object.entries(options.paths).map(([pattern, targets]) => [pattern, targets.map(t => (isAbsolute(t) ? t : resolve(base, t)))])
    );
  }

  return overrides;
}

export interface CheckedConfig {
  /** The project's own config, relative to the target. */
  config: string;
  /** What the checkers are given: the config itself, or its shadow. */
  path: string;
  overrides: Record<string, unknown> | null;
}

export class ShadowStore {
  readonly target: string;
  readonly dir: string;

  constructor(target: string) {
    this.target = target;
    this.dir = join(target, '.ts-check-arena');
  }

  /** The config to check: a shadow when overrides are needed, else the config itself. */
  prepare(config: string, mode: 'auto' | 'never'): CheckedConfig {
    const absolute = resolve(this.target, config);
    if (mode === 'never') return { config, path: absolute, overrides: null };
    const overrides = shadowOverrides(absolute, this.target);
    if (Object.keys(overrides).length === 0) return { config, path: absolute, overrides: null };
    mkdirSync(join(this.dir, 'shadow'), { recursive: true });
    writeFileSync(join(this.dir, '.gitignore'), '*\n');
    const file = join(this.dir, 'shadow', `${createHash('sha1').update(config).digest('hex').slice(0, 16)}.json`);
    writeFileSync(file, `${JSON.stringify({ extends: absolute, compilerOptions: overrides }, null, 2)}\n`);
    return { config, path: file, overrides };
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}
