// Turns a run's raw records (run.json, timing.csv, parity.json) into summary.json,
// which the site reads, and report.md, which people read. Both are regenerated from
// the raw records at any time, so a change to how numbers are computed applies to
// every past run.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ParityResult } from './diagnostics.ts';
import { RESULTS_DIR } from './paths.ts';
import type { RunMeta } from './run.ts';
import { type Summary, type Timing, combine, speedup, summarize } from './stats.ts';

export interface CheckerSummary extends Summary {
  id: string;
  family: string;
  version: string;
  /** Reference median wall time / this checker's. */
  speedup: number;
}

export interface ParitySummary {
  id: string;
  identical: number;
  sameNormalized: number;
  differs: number;
  failed: number;
  extra: number;
  missing: number;
}

export interface RunSummary {
  schema: 1;
  id: string;
  label: string;
  date: string;
  source: RunMeta['source'];
  machine: RunMeta['machine'];
  reference: string;
  rounds: number;
  configs: { checked: number; rejected: number; shadowed: number };
  settings: { threads: string; checkers: CheckerSummary[] }[];
  parity: ParitySummary[];
  unavailable: string[];
  /** Checkers that failed on a config and were therefore not timed. */
  untimed: string[];
}

interface Row {
  threads: string;
  round: number;
  warm: boolean;
  checker: string;
  config: string;
  timing: Timing;
}

export function readTiming(csv: string): Row[] {
  return csv
    .trim()
    .split('\n')
    .slice(1)
    .map(line => {
      // The config path may not contain commas; checkers ids never do.
      const [threads, round, warm, checker, config, real, user, sys, maxrss] = line.split(',');
      return {
        threads: threads!,
        round: Number(round),
        warm: warm === 'true',
        checker: checker!,
        config: config!,
        timing: { real: Number(real), user: Number(user), sys: Number(sys), maxrss: Number(maxrss) },
      };
    });
}

export function summarizeRun(meta: RunMeta, rows: Row[], parity: Record<string, Record<string, ParityResult>>): RunSummary {
  const settings = [...new Set(rows.map(r => r.threads))].map(threads => {
    const inSetting = rows.filter(r => r.threads === threads && !r.warm);
    const ids = [...new Set(inSetting.map(r => r.checker))];
    const summaries = ids.map(id => {
      const rounds = [...new Set(inSetting.filter(r => r.checker === id).map(r => r.round))];
      const passes = rounds.map(round => combine(inSetting.filter(r => r.checker === id && r.round === round).map(r => r.timing)));
      const checker = meta.checkers.find(c => c.id === id)!;
      return { id, family: checker.family, version: checker.version, ...summarize(passes), speedup: 0 };
    });
    const ref = summaries.find(s => s.id === meta.reference);
    for (const s of summaries) s.speedup = ref ? speedup(ref.median, s.median) : Number.NaN;
    return { threads, checkers: summaries.sort((a, b) => a.median - b.median) };
  });

  const paritySummaries = Object.entries(parity).map(([id, byConfig]) => {
    const results = Object.values(byConfig);
    const count = (p: ParityResult['parity']) => results.filter(r => r.parity === p).length;
    return {
      id,
      identical: count('identical'),
      sameNormalized: count('same-normalized'),
      differs: count('differs'),
      failed: count('failed'),
      extra: results.reduce((s, r) => s + r.extra.length, 0),
      missing: results.reduce((s, r) => s + r.missing.length, 0),
    };
  });

  return {
    schema: 1,
    id: meta.id,
    label: meta.label,
    date: meta.startedAt,
    source: meta.source,
    machine: meta.machine,
    reference: meta.reference,
    rounds: meta.rounds,
    configs: {
      checked: meta.configs.checked.length,
      rejected: meta.configs.rejected.length,
      shadowed: meta.configs.checked.filter(c => c.shadow).length,
    },
    settings,
    parity: paritySummaries,
    unavailable: meta.checkers.filter(c => !c.available).map(c => c.id),
    untimed: paritySummaries.filter(p => p.failed > 0).map(p => p.id),
  };
}

const s2 = (n: number) => (n < 1 ? n.toFixed(3) : n.toFixed(2));

/** tsrs@0.20.1-ts7.1.0-beta+fast reads as tsrs@0.20.1+fast: the TypeScript port tag is in run.json. */
export const shortToolId = (id: string): string => id.replace(/-ts\d[^+]*/, '');

export function renderMarkdown(meta: RunMeta, summary: RunSummary): string {
  const lines: string[] = [];
  const where = meta.source.kind === 'ci' ? `CI runner \`${meta.source.runner}\`` : 'local machine';
  const shortId = shortToolId;
  const minutes = Math.round((Date.parse(meta.endedAt) - Date.parse(meta.startedAt)) / 60000);
  const main = summary.settings.find(s => s.threads === 'default') ?? summary.settings[0];
  const fastest = main?.checkers[0];
  const agree = summary.parity.filter(p => p.differs === 0 && p.failed === 0).length;

  lines.push(`# ${meta.label}`, '');
  if (fastest) {
    const lead = fastest.id === meta.reference ? 'is the fastest checker' : `is **${fastest.speedup.toFixed(1)}×** faster than \`${shortId(meta.reference)}\``;
    lines.push(`> **\`${shortId(fastest.id)}\`** ${lead}: ${s2(fastest.median)} s for one pass over ${summary.configs.checked} configs. ${agree} of ${summary.parity.length} checkers report exactly the reference's diagnostics.`, '');
  }
  lines.push('| | |', '|---|---|');
  lines.push(`| **Machine** | ${meta.machine.cpu}, ${meta.machine.cores} cores, ${meta.machine.memoryGiB} GiB |`);
  lines.push(`| **System** | ${meta.machine.os}, Node ${meta.machine.node}, ${where} |`);
  lines.push(`| **When** | ${meta.startedAt.slice(0, 16).replace('T', ' ')} UTC, ${minutes} min |`);
  lines.push(`| **Method** | median of ${meta.rounds} rounds after one warm-up; checker order rotated every round |`);
  lines.push(`| **Configs** | ${summary.configs.checked} checked, ${summary.configs.shadowed} through a shadow config, ${summary.configs.rejected} rejected |`);
  lines.push(`| **Reference** | \`${meta.reference}\` |`);
  lines.push(`| **Run** | \`${meta.id}\` |`, '');
  if (summary.unavailable.length) lines.push(`No build for ${meta.machine.platform}: ${summary.unavailable.map(i => `\`${i}\``).join(', ')}.`, '');
  if (summary.untimed.length) lines.push(`**Not timed**, because they failed on a config (see Diagnostics and \`parity/\`): ${summary.untimed.map(i => `\`${i}\``).join(', ')}.`, '');

  for (const setting of summary.settings) {
    lines.push(`## ${setting.threads === 'default' ? 'Speed, as shipped' : `Speed, ${setting.threads} ${setting.threads === '1' ? 'thread' : 'threads'}`}`, '');
    lines.push('One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.', '');
    lines.push('| Checker | Wall | Range | vs reference | CPU | Peak |', '|---|--:|--:|--:|--:|--:|');
    for (const c of setting.checkers) {
      lines.push(`| \`${shortId(c.id)}\` | **${s2(c.median)} s** | ${s2(c.min)} to ${s2(c.max)} | ${c.speedup.toFixed(1)}× | ${s2(c.cpu)} s | ${Math.round(c.rssMiB)} MiB |`);
    }
    lines.push('');
  }
  lines.push('## Diagnostics', '', `Each checker's output on every config, compared with \`${meta.reference}\`.`, '');
  lines.push('| Checker | Result | Identical | Same after normalizing | Differs | Failed | Extra | Missing |', '|---|---|--:|--:|--:|--:|--:|--:|');
  for (const p of summary.parity) {
    const result = p.failed ? '❌ failed' : p.differs ? '⚠️ differs' : p.sameNormalized ? '✅ same errors' : '✅ identical';
    lines.push(`| \`${shortToolId(p.id)}\` | ${result} | ${p.identical} | ${p.sameNormalized} | ${p.differs} | ${p.failed} | ${p.extra} | ${p.missing} |`);
  }
  lines.push('', 'Extra: diagnostics only that checker reported. Missing: diagnostics only the reference reported. The full output of every differing config is in parity/.', '');
  const sets = Object.entries(meta.shadows ?? {});
  if (sets.length) {
    lines.push('## Shadow configs', '', 'Overrides applied so TypeScript 7 reads the configs; full values in run.json.', '', '| Set | Configs | Overrides |', '|---|---|---|');
    for (const [key, overrides] of sets) {
      const count = meta.configs.checked.filter(c => c.shadow === key).length;
      lines.push(`| ${key} | ${count} | ${Object.keys(overrides).map(k => `\`${k}\``).join(', ')} |`);
    }
    lines.push('');
  }
  if (meta.configs.rejected.length) {
    lines.push('## Rejected configs', '', '| Config | Reason | Detail |', '|---|---|---|');
    for (const r of meta.configs.rejected) lines.push(`| ${r.config} | ${r.reason} | ${r.detail.replace(/\s+/g, ' ').replaceAll('|', '\\|').slice(0, 160)} |`);
    lines.push('');
  }
  lines.push('## Checkers', '', '| Checker | Package | Default threads | Version output | Binary sha256 |', '|---|---|---|---|---|');
  for (const c of meta.checkers) {
    const mode = c.variant ? ` with \`${(c.variantArgs ?? []).join(' ')}\`` : '';
    lines.push(`| ${c.id} | ${c.package}@${c.version}${mode} | ${c.defaultThreads ?? (c.variant ? 'set by the mode' : '')} | ${c.available ? (c.versionOutput ?? '') : 'no build'} | ${c.binarySha256?.slice(0, 16) ?? ''} |`);
  }
  if (meta.conditions.warnings.length) lines.push('', '## Conditions', '', ...meta.conditions.warnings.map(w => `- ${w}`));
  return `${lines.join('\n')}\n`;
}

export function writeReport(dir: string): RunSummary {
  const meta = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as RunMeta;
  const rows = readTiming(readFileSync(join(dir, 'timing.csv'), 'utf8'));
  const parity = JSON.parse(readFileSync(join(dir, 'parity.json'), 'utf8')) as Record<string, Record<string, ParityResult>>;
  const summary = summarizeRun(meta, rows, parity);
  writeFileSync(join(dir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(join(dir, 'report.md'), renderMarkdown(meta, summary));
  return summary;
}

/** Every published run (results/<id>/), newest first, for the site. */
export function writeIndex(root = RESULTS_DIR): string[] {
  const runs = existsSync(root)
    ? readdirSync(root, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'private' && existsSync(join(root, d.name, 'summary.json')))
        .map(d => d.name)
        .sort()
        .reverse()
    : [];
  writeFileSync(join(root, 'index.json'), `${JSON.stringify({ runs }, null, 2)}\n`);
  return runs.map(r => relative(root, join(root, r)));
}
