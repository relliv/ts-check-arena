import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The arena checkout. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const TOOLS_DIR = join(ROOT, 'tools');
/** ARENA_RESULTS_DIR points elsewhere, such as a checkout of the data branch in CI. */
export const RESULTS_DIR = process.env['ARENA_RESULTS_DIR'] ? resolve(process.env['ARENA_RESULTS_DIR']) : join(ROOT, 'results');
/**
 * Corpus checkouts live outside this repository: TypeScript loads every
 * node_modules/@types package up the directory tree, so a checkout under the
 * arena would also see the arena's own dependencies.
 */
export const CORPUS_DIR =
  process.env['ARENA_CORPUS_DIR'] ??
  (process.platform === 'win32'
    ? join(process.env['LOCALAPPDATA'] ?? homedir(), 'ts-check-arena', 'corpus')
    : join(process.env['XDG_CACHE_HOME'] ?? join(homedir(), '.cache'), 'ts-check-arena', 'corpus'));
export const FIXTURES_DIR = join(ROOT, 'fixtures');

/** `<platform>-<arch>` as the checkers' platform packages name it, such as darwin-arm64. */
export const PLATFORM = `${process.platform}-${process.arch}`;
