// One benchmark run into results/<id>/. docs/METHOD.md describes every step; this
// file is the only place they are carried out.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { type ThreadSetting, type Tool, availableOn, binaryPath, command, installedVersion, parseTool, threadArgs } from './checkers.ts';
import { type ParityResult, compareOutputs } from './diagnostics.ts';
import { type Machine, type Source, holdAwake, machine, onAC, source, underRosetta, warnings } from './machine.ts';
import { capture, measure, timingPrerequisites } from './measure.ts';
import { PLATFORM, RESULTS_DIR, ROOT } from './paths.ts';
import { type Scrubber, scrubber } from './scrub.ts';
import { type CheckedConfig, ShadowStore } from './shadow.ts';
import { type Measured, rotate } from './stats.ts';
import { type Discovery, discoverConfigs, targetRevision } from './targets.ts';
import { writeReport } from './report.ts';

export interface RunOptions {
  target: string;
  label?: string;
  /** Whether the target is a public corpus project; path targets stay in results/private/. */
  corpus?: boolean;
  checkers: string[];
  reference: string;
  configs?: string[];
  discovery?: Discovery;
  rounds?: number;
  threads?: ThreadSetting[];
  shadow?: 'auto' | 'never';
  allowBattery?: boolean;
  smoke?: boolean;
  /**
   * false: nothing is kept. The run writes to a temporary folder, prints its report
   * and deletes the folder, so a private project leaves no record in results/.
   */
  save?: boolean;
  log?: (line: string) => void;
}

export interface Rejected {
  config: string;
  reason: 'errors' | 'not-measured' | 'config-error';
  detail: string;
}

export interface RunMeta {
  schema: 1;
  id: string;
  label: string;
  startedAt: string;
  endedAt: string;
  source: Source;
  machine: Machine;
  target: { kind: 'corpus' | 'path'; discovery: Discovery; commit: string | null; dirty: boolean | null };
  reference: string;
  rounds: number;
  threads: ThreadSetting[];
  checkers: {
    id: string;
    family: string;
    package: string;
    version: string;
    available: boolean;
    versionOutput: string | null;
    binarySha256: string | null;
  }[];
  /**
   * Shadow config overrides, recorded once per distinct set and keyed by a short
   * hash; a config's `shadow` names its set. Configs that extend one base share a
   * set, so a monorepo records a handful instead of one copy per config.
   */
  shadows: Record<string, Record<string, unknown>>;
  configs: { checked: { config: string; shadow: string | null }[]; rejected: Rejected[] };
  conditions: { warnings: string[]; loadStart: number[]; loadEnd: number[] };
}

export interface TimingRow {
  threads: ThreadSetting;
  round: number;
  warm: boolean;
  checker: string;
  config: string;
  m: Measured;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function runId(label: string, smoke: boolean): string {
  const now = new Date().toISOString();
  const cpu = slug(os.cpus()[0]?.model ?? os.machine());
  return smoke ? `${now.slice(0, 19).replaceAll(':', '')}-${slug(label)}` : `${now.slice(0, 10)}-${cpu}-${process.platform}-${slug(label)}`;
}

function uniqueDir(base: string): string {
  let dir = base;
  for (let i = 2; existsSync(dir); i++) dir = `${base}-${i}`;
  return dir;
}

function versionOutput(tool: Tool): string | null {
  const bin = binaryPath(tool);
  if (!bin) return null;
  const argv = tool.family.runtime === 'node' ? [process.execPath, bin, '--version'] : [bin, '--version'];
  return capture(argv, ROOT).text.trim().split('\n')[0] ?? null;
}

export async function run(options: RunOptions): Promise<string | null> {
  const log = options.log ?? (line => console.log(line));
  const label = options.label ?? basename(options.target);
  const smoke = Boolean(options.smoke);
  const rounds = options.rounds ?? (smoke ? 1 : 7);
  if (!smoke && rounds % 2 === 0) throw new Error('--rounds must be odd, so every median is a measured run');
  const threads = options.threads ?? ['default'];

  const ids = [...new Set([options.reference, ...options.checkers])];
  const tools = ids.map(parseTool);
  const reference = tools[0]!;
  const runnable = tools.filter(t => availableOn(t));
  for (const t of runnable) {
    if (!binaryPath(t)) throw new Error(`${t.id} is not installed; run pnpm arena tool add ${t.id}`);
  }
  if (!availableOn(reference)) throw new Error(`the reference ${reference.id} has no build for ${PLATFORM}`);

  const blockers = [...timingPrerequisites()];
  if (underRosetta()) blockers.push('node runs under Rosetta; use an arm64 node');
  if (!options.allowBattery && !onAC()) blockers.push('on battery power; connect power or pass --allow-battery');
  if (blockers.length) throw new Error(`refusing to run:\n  ${blockers.join('\n  ')}`);

  // TypeScript includes every node_modules/@types package from the folders above a
  // config that sets no `types`, so @types above a corpus checkout would change what
  // is checked: refused. Any other node_modules above the target only matters for an
  // import the project does not install itself, which the gate would show: recorded.
  const above: string[] = [];
  for (let d = dirname(options.target); d !== dirname(d); d = dirname(d)) if (existsSync(join(d, 'node_modules'))) above.push(d);
  const typesAbove = above.filter(d => existsSync(join(d, 'node_modules', '@types')));
  if (typesAbove.length && options.corpus) {
    throw new Error(`refusing to run: node_modules/@types above the corpus checkout, in ${typesAbove.join(', ')}; set ARENA_CORPUS_DIR elsewhere`);
  }

  // The folder name is the run's id, so a second run on the same day (folder -2)
  // gets its own id too.
  const save = options.save !== false;
  const dir = save
    ? uniqueDir(join(RESULTS_DIR, smoke ? '.smoke' : options.corpus ? '' : 'private', runId(label, smoke)))
    : join(mkdtempSync(join(os.tmpdir(), 'arena-run-')), runId(label, smoke));
  const id = basename(dir);
  mkdirSync(dir, { recursive: true });
  const scrub: Scrubber = scrubber({ '<target>': options.target, '<arena>': ROOT });

  const startedAt = new Date().toISOString();
  const loadStart = os.loadavg();
  const conditionWarnings = [...warnings(), ...above.map(d => `node_modules above the target in ${d}`)];
  const release = holdAwake();
  const shadows = new ShadowStore(options.target);

  try {
    // Configs, and the shadow each needs.
    const discovered = discoverConfigs(options.target, options.discovery ?? 'auto', options.configs ?? []);
    log(`${label}: ${discovered.configs.length} configs (${discovered.mode}); reference ${reference.id}; checkers ${runnable.map(t => t.id).join(', ')}`);
    const prepared: CheckedConfig[] = [];
    const rejected: Rejected[] = [];
    for (const config of discovered.configs) {
      try {
        prepared.push(shadows.prepare(config, options.shadow ?? 'auto'));
      } catch (error) {
        rejected.push({ config, reason: 'config-error', detail: scrub((error as Error).message) });
      }
    }

    // Gate: the reference must report no errors on a config for it to be timed.
    const outputs = new Map<string, Map<string, { text: string; exit: number }>>();
    const checked: CheckedConfig[] = [];
    for (const c of prepared) {
      const out = capture(command(reference, c.path, { plain: true })!, options.target);
      const result = compareOutputs(out, { text: '' });
      if (result.errors > 0) rejected.push({ config: c.config, reason: 'errors', detail: `${result.errors} errors from ${reference.id}` });
      else if (out.exit !== 0) rejected.push({ config: c.config, reason: 'not-measured', detail: scrub(out.text.slice(-400)) });
      else {
        checked.push(c);
        outputs.set(c.config, new Map([[reference.id, out]]));
      }
    }
    log(`gate: ${checked.length} checked, ${rejected.length} rejected`);
    if (checked.length === 0) throw new Error('no config passed the gate');

    // Diagnostics: every checker once per config, compared with the reference.
    const parity: Record<string, Record<string, ParityResult>> = {};
    for (const t of runnable) {
      parity[t.id] = {};
      for (const c of checked) {
        const byTool = outputs.get(c.config)!;
        const out = byTool.get(t.id) ?? capture(command(t, c.path, { plain: true })!, options.target);
        byTool.set(t.id, out);
        const result = compareOutputs(out, byTool.get(reference.id)!);
        parity[t.id]![c.config] = { ...result, extra: result.extra.map(scrub), missing: result.missing.map(scrub) };
        if (result.parity === 'differs' || result.parity === 'failed') {
          const file = join(dir, 'parity', t.id, `${slug(c.config)}.txt`);
          mkdirSync(join(dir, 'parity', t.id), { recursive: true });
          writeFileSync(file, scrub(out.text));
        }
      }
    }

    // A checker that fails on any config (exits non-zero without a diagnostic) is
    // not timed: a fast failure is not a fast check.
    const failing = runnable.filter(t => Object.values(parity[t.id]!).some(r => r.parity === 'failed'));
    for (const t of failing) log(`  ${t.id}: failed on ${Object.values(parity[t.id]!).filter(r => r.parity === 'failed').length} configs, not timed (see parity/)`);
    const timed = runnable.filter(t => !failing.includes(t));

    // Timing: a warm-up round, then `rounds` rounds per thread setting. Each round
    // checks every config with every checker, starting one checker further along
    // than the round before.
    const rows: TimingRow[] = [];
    for (const setting of threads) {
      const lane = timed.filter(t => threadArgs(t, setting) !== null);
      for (let round = 0; round <= rounds; round++) {
        const warm = round === 0;
        if (!options.allowBattery && !onAC()) throw new Error('power was disconnected during the run');
        for (const t of rotate(lane, round % lane.length)) {
          let total = 0;
          for (const c of checked) {
            const m = measure(command(t, c.path, { threads: setting })!, options.target);
            const expected = outputs.get(c.config)!.get(t.id)!.exit;
            if (setting === 'default' && m.exit !== expected) throw new Error(`${t.id} exited ${m.exit} on ${c.config} while timed, ${expected} when its output was recorded`);
            rows.push({ threads: setting, round, warm, checker: t.id, config: c.config, m });
            total += m.real;
          }
          log(`  threads=${setting} ${warm ? 'warm-up' : `round ${round}/${rounds}`} ${t.id.padEnd(28)} ${total.toFixed(2)}s`);
        }
      }
    }

    const shadowSets: Record<string, Record<string, unknown>> = {};
    const shadowKey = (overrides: Record<string, unknown> | null): string | null => {
      if (!overrides) return null;
      const text = scrub(JSON.stringify(overrides));
      const key = createHash('sha256').update(text).digest('hex').slice(0, 12);
      shadowSets[key] ??= JSON.parse(text) as Record<string, unknown>;
      return key;
    };
    const checkedConfigs = checked.map(c => ({ config: c.config, shadow: shadowKey(c.overrides) }));

    const meta: RunMeta = {
      schema: 1,
      id,
      label,
      startedAt,
      endedAt: new Date().toISOString(),
      source: source(),
      machine: machine(),
      target: { kind: options.corpus ? 'corpus' : 'path', discovery: discovered.mode, ...targetRevision(options.target) },
      reference: reference.id,
      rounds,
      threads,
      checkers: tools.map(t => {
        const bin = availableOn(t) ? binaryPath(t) : null;
        return {
          id: t.id,
          family: t.family.name,
          package: t.family.package,
          version: installedVersion(t) ?? t.version,
          available: availableOn(t),
          versionOutput: bin ? scrub(versionOutput(t) ?? '') : null,
          binarySha256: bin ? sha256(bin) : null,
        };
      }),
      shadows: shadowSets,
      configs: {
        checked: checkedConfigs,
        rejected,
      },
      conditions: { warnings: conditionWarnings.map(scrub), loadStart, loadEnd: os.loadavg() },
    };

    writeFileSync(join(dir, 'run.json'), `${JSON.stringify(meta, null, 2)}\n`);
    writeFileSync(
      join(dir, 'timing.csv'),
      ['threads,round,warm,checker,config,real,user,sys,maxrss,exit', ...rows.map(r => [r.threads, r.round, r.warm, r.checker, r.config, r.m.real, r.m.user, r.m.sys, r.m.maxrss, r.m.exit].join(','))].join('\n') + '\n'
    );
    writeFileSync(join(dir, 'parity.json'), `${JSON.stringify(parity, null, 2)}\n`);
    writeReport(dir);
    if (!save) {
      log('');
      log(readFileSync(join(dir, 'report.md'), 'utf8'));
      log('not saved (--no-save): the records above were deleted with their temporary folder');
      return null;
    }
    log(`results: ${relative(ROOT, dir)}`);
    return dir;
  } finally {
    shadows.cleanup();
    if (!save) rmSync(dirname(dir), { recursive: true, force: true });
    release();
  }
}
