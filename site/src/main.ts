// The arena site: every published run, read from results/*/summary.json at build
// time. No framework; the page is re-rendered from state on every change.
import type { CheckerSummary, RunSummary } from '../../src/lib/report.ts';

declare const __ARENA_PRIVATE__: boolean;

const published = import.meta.glob<RunSummary>('../../results/*/summary.json', { eager: true, import: 'default' });
const local = import.meta.glob<RunSummary>('../../results/private/*/summary.json', { eager: true, import: 'default' });
const runs: RunSummary[] = [...Object.values(published), ...(__ARENA_PRIVATE__ ? Object.values(local) : [])].sort((a, b) =>
  b.date.localeCompare(a.date)
);

const FAMILY_ORDER = ['tsc', 'tsgo', 'tsrs', 'tsc-rs', 'tsc-ts', 'bun'];
const color = (family: string) => `var(--color-family-${family}, currentColor)`;
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const secs = (n: number) => (n < 1 ? `${(n * 1000).toFixed(0)} ms` : `${n.toFixed(2)} s`);
const times = (n: number) => (Number.isFinite(n) ? `${n.toFixed(1)}×` : 'n/a');

const state = {
  runId: runs[0]?.id ?? '',
  threads: 'default',
};

function where(run: RunSummary): string {
  return run.source.kind === 'ci' ? `CI ${run.source.runner ?? ''}` : 'local';
}

/** Splits family@version and orders versions numerically. */
function versionKey(id: string): [string, string] {
  const at = id.lastIndexOf('@');
  return [id.slice(0, at), id.slice(at + 1)];
}

function bars(checkers: CheckerSummary[]): string {
  const max = Math.max(...checkers.map(c => c.max));
  return `<div class="bars">${checkers
    .map(c => {
      const pct = (v: number) => `${((v / max) * 100).toFixed(2)}%`;
      return `<div class="row">
        <span class="name" title="${esc(c.id)}"><span class="swatch" style="background:${color(c.family)}"></span> ${esc(c.id)}</span>
        <span class="track">
          <span class="fill" style="width:${pct(c.median)};background:${color(c.family)}"></span>
          <span class="whisker" style="left:${pct(c.min)};width:calc(${pct(c.max)} - ${pct(c.min)})"></span>
        </span>
        <span class="value">${secs(c.median)}</span>
      </div>`;
    })
    .join('')}</div>`;
}

function timingTable(run: RunSummary, checkers: CheckerSummary[]): string {
  return `<div class="table-scroll"><table class="grid-table">
    <thead><tr><th>Checker</th><th>Wall, median</th><th>Min to max</th><th>vs ${esc(run.reference)}</th><th>CPU</th><th>Peak MiB</th></tr></thead>
    <tbody>${checkers
      .map(
        c => `<tr>
        <td>${esc(c.id)}</td><td>${secs(c.median)}</td><td>${secs(c.min)} to ${secs(c.max)}</td>
        <td class="${c.speedup >= 1 ? 'good' : 'bad'}">${times(c.speedup)}</td>
        <td>${secs(c.cpu)}</td><td>${Math.round(c.rssMiB)}</td></tr>`
      )
      .join('')}</tbody></table></div>`;
}

function parityTable(run: RunSummary): string {
  return `<div class="table-scroll"><table class="grid-table">
    <thead><tr><th>Checker</th><th>Identical</th><th>Same after normalizing</th><th>Differs</th><th>Failed</th><th>Extra</th><th>Missing</th></tr></thead>
    <tbody>${run.parity
      .map(
        p => `<tr><td>${esc(p.id)}</td><td>${p.identical}</td><td>${p.sameNormalized}</td>
        <td class="${p.differs ? 'bad' : ''}">${p.differs}</td><td class="${p.failed ? 'bad' : ''}">${p.failed}</td>
        <td>${p.extra}</td><td>${p.missing}</td></tr>`
      )
      .join('')}</tbody></table></div>`;
}

/**
 * Speedup against the reference for every version of each family, across all runs
 * of this target on this platform: the newest run per version wins. One small
 * chart per family, versions in numeric order.
 */
function trends(run: RunSummary): string {
  const related = runs.filter(r => r.label === run.label && r.machine.platform === run.machine.platform && r.source.kind === run.source.kind);
  const byFamily = new Map<string, Map<string, number>>();
  for (const r of [...related].reverse()) {
    const setting = r.settings.find(s => s.threads === 'default');
    for (const c of setting?.checkers ?? []) {
      const [family, version] = versionKey(c.id);
      if (!byFamily.has(family)) byFamily.set(family, new Map());
      byFamily.get(family)!.set(version, c.speedup);
    }
  }
  const families = FAMILY_ORDER.filter(f => byFamily.has(f));
  if (families.length === 0) return '';
  return `<div class="trend">${families
    .map(family => {
      const points = [...byFamily.get(family)!.entries()].sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }));
      const top = Math.max(1, ...points.map(p => p[1]));
      const x = (i: number) => (points.length === 1 ? 50 : 8 + (i / (points.length - 1)) * 84);
      const y = (v: number) => 90 - (v / top) * 80;
      const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p[1])}`).join(' ');
      return `<div class="family">
        <div class="family-name"><span class="swatch" style="background:${color(family)}"></span>${esc(family)}</div>
        <svg viewBox="0 0 100 110" preserveAspectRatio="none" role="img" aria-label="${esc(family)} speedup by version">
          <line x1="0" x2="100" y1="${y(1)}" y2="${y(1)}" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" />
          <path d="${path}" fill="none" stroke="${color(family)}" stroke-width="2" vector-effect="non-scaling-stroke" />
          ${points
            .map(
              (p, i) => `<circle cx="${x(i)}" cy="${y(p[1])}" r="2.5" fill="${color(family)}"><title>${esc(family)}@${esc(p[0])}: ${times(p[1])}</title></circle>
              <text x="${x(i)}" y="${y(p[1]) - 5}" font-size="6" text-anchor="middle" fill="currentColor">${times(p[1])}</text>
              <text x="${x(i)}" y="106" font-size="5" text-anchor="middle" fill="currentColor" opacity="0.6">${esc(p[0].replace(/-ts7.*$/, ''))}</text>`
            )
            .join('')}
        </svg>
      </div>`;
    })
    .join('')}</div>`;
}

/** The newest run per platform for this target, compared on each family's newest version. */
function platforms(run: RunSummary): string {
  const newest = new Map<string, RunSummary>();
  for (const r of runs.filter(r => r.label === run.label)) if (!newest.has(r.machine.platform)) newest.set(r.machine.platform, r);
  if (newest.size < 2) return '';
  const list = [...newest.values()];
  const ids = [...new Set(list.flatMap(r => r.settings.find(s => s.threads === 'default')?.checkers.map(c => c.id) ?? []))].sort();
  return `<section class="panel"><h2>Across platforms</h2>
    <p class="hint">Newest run per platform. Speedup against each run's own reference; compare ratios, not seconds.</p>
    <div class="table-scroll"><table class="grid-table"><thead><tr><th>Checker</th>${list.map(r => `<th>${esc(r.machine.platform)}<br>${esc(where(r))}</th>`).join('')}</tr></thead>
    <tbody>${ids
      .map(id => `<tr><td>${esc(id)}</td>${list
        .map(r => {
          const c = r.settings.find(s => s.threads === 'default')?.checkers.find(x => x.id === id);
          return `<td>${c ? times(c.speedup) : r.unavailable.includes(id) ? 'no build' : '-'}</td>`;
        })
        .join('')}</tr>`)
      .join('')}</tbody></table></div></section>`;
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const head = `<header class="masthead">
      <h1 class="title">ts-check-arena</h1>
      <p class="lede">Speed, memory and diagnostics of TypeScript type checkers, across versions and platforms. Every number links back to raw records in the repository: timing.csv, run.json and each checker's output.</p>
    </header>`;
  const run = runs.find(r => r.id === state.runId);
  if (!run) {
    app.innerHTML = `${head}<div class="empty">No published runs yet. Run <code>pnpm arena run</code>, then publish or let CI commit results.</div>`;
    return;
  }
  const settings = run.settings.map(s => s.threads);
  if (!settings.includes(state.threads)) state.threads = settings[0] ?? 'default';
  const setting = run.settings.find(s => s.threads === state.threads)!;

  app.innerHTML = `${head}
    <div class="controls">
      <label>Run<select id="run">${runs
        .map(r => `<option value="${esc(r.id)}" ${r.id === run.id ? 'selected' : ''}>${esc(r.label)} · ${esc(r.machine.platform)} · ${esc(where(r))} · ${esc(r.date.slice(0, 10))}</option>`)
        .join('')}</select></label>
      <label>Threads<select id="threads">${settings.map(t => `<option ${t === state.threads ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
    </div>
    <section class="panel">
      <h2>${esc(run.label)}</h2>
      <div class="meta">
        <span class="badge ${run.source.kind}">${esc(where(run))}</span>
        <span class="badge">${esc(run.machine.cpu)}</span>
        <span class="badge">${run.machine.cores} cores · ${run.machine.memoryGiB} GiB</span>
        <span class="badge">${esc(run.machine.os)}</span>
        <span class="badge">${run.configs.checked} configs${run.configs.shadowed ? `, ${run.configs.shadowed} shadowed` : ''}</span>
        <span class="badge">median of ${run.rounds}</span>
      </div>
      <p class="hint">Wall time for one pass over every config, median of ${run.rounds} rounds; the line spans min to max. Reference: ${esc(run.reference)}.</p>
      ${bars(setting.checkers)}
    </section>
    <section class="panel"><h2>Numbers</h2>${timingTable(run, setting.checkers)}
      ${run.unavailable.length ? `<p class="hint">No build for ${esc(run.machine.platform)}: ${esc(run.unavailable.join(', '))}.</p>` : ''}
      ${run.untimed.length ? `<p class="hint">Not timed, failed on a config: ${esc(run.untimed.join(', '))}.</p>` : ''}
    </section>
    <section class="panel"><h2>Across versions</h2><p class="hint">Speedup against the reference by version, newest run of ${esc(run.label)} on ${esc(run.machine.platform)} per version. The dashed line is the reference.</p>${trends(run)}</section>
    ${platforms(run)}
    <section class="panel"><h2>Diagnostics</h2><p class="hint">Each checker's output on every config, compared with ${esc(run.reference)}.</p>${parityTable(run)}</section>
    <footer class="footer">Method: <a href="https://github.com/relliv/ts-check-arena/blob/main/docs/METHOD.md">docs/METHOD.md</a>. Raw records: <code>results/${esc(run.id)}/</code>.</footer>`;

  app.querySelector<HTMLSelectElement>('#run')!.onchange = e => {
    state.runId = (e.target as HTMLSelectElement).value;
    render();
  };
  app.querySelector<HTMLSelectElement>('#threads')!.onchange = e => {
    state.threads = (e.target as HTMLSelectElement).value;
    render();
  };
}

render();
