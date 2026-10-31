// The arena site: every published run, read from results/*/summary.json and from
// the data branch at build time. No framework; the page re-renders from state on
// every change.
import type { CheckerSummary, RunSummary } from '../../src/lib/report.ts';
import dataBranch from 'virtual:arena-data';
import { FAMILIES, categoryAxis, disposeAll, familyColor, ink, isNarrow, mount, valueAxis } from './charts.ts';

declare const __ARENA_PRIVATE__: boolean;

const published = import.meta.glob<RunSummary>('../../results/*/summary.json', { eager: true, import: 'default' });
const local = import.meta.glob<RunSummary>('../../results/private/*/summary.json', { eager: true, import: 'default' });
// A run can be both checked out and on the data branch; the checkout wins.
const runs: RunSummary[] = [
  ...new Map([...dataBranch, ...Object.values(published), ...(__ARENA_PRIVATE__ ? Object.values(local) : [])].map(r => [r.id, r])).values(),
].sort((a, b) => b.date.localeCompare(a.date));

type Metric = 'wall' | 'cpu' | 'memory';

type CompareMetric = 'speedup' | Metric;

const state: { runId: string; threads: string; metric: Metric; compare: string[] | null; compareMetric: CompareMetric } = {
  runId: runs[0]?.id ?? '',
  threads: 'default',
  metric: 'wall',
  // Runs shown side by side, from a day's Compare button; null hides the panel.
  compare: null,
  compareMetric: 'speedup',
};

// ---------------------------------------------------------------------------- formatting

const esc = (s: unknown): string => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const secs = (n: number): string => (n < 1 ? `${Math.round(n * 1000)} ms` : `${n.toFixed(2)} s`);
const times = (n: number): string => (Number.isFinite(n) ? `${n >= 10 ? n.toFixed(0) : n.toFixed(1)}×` : 'n/a');
const mib = (n: number): string => (n >= 1024 ? `${(n / 1024).toFixed(1)} GiB` : `${Math.round(n)} MiB`);

/** "tsrs@0.20.1-ts7.1.0-beta+fast" reads as "tsrs 0.20.1 +fast"; the full id stays in tooltips. */
function short(id: string): string {
  const at = id.lastIndexOf('@');
  return `${id.slice(0, at)} ${shortVersion(id.slice(at + 1))}`;
}

/** Drops the TypeScript port tag and spaces out a variant: "0.20.1-ts7.1.0-beta+fast" is "0.20.1 +fast". */
const shortVersion = (version: string): string => version.replace(/-ts\d[^+]*/, '').replace('+', ' +');

const familyOf = (id: string): string => id.slice(0, id.lastIndexOf('@'));
const versionOf = (id: string): string => id.slice(id.lastIndexOf('@') + 1);
const where = (run: RunSummary): string => (run.source.kind === 'ci' ? `CI · ${run.source.runner ?? ''}` : 'Local machine');
const day = (iso: string): string => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

function compareVersions(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true });
}

// ---------------------------------------------------------------------------- markup

function tile(label: string, value: string, note: string, swatch?: string): string {
  return `<div class="tile">
    <div class="tile-label">${swatch ? `<span class="swatch" style="background:${swatch}"></span>` : ''}${esc(label)}</div>
    <div class="tile-value">${value}</div>
    <div class="tile-note">${note}</div>
  </div>`;
}

function hero(run: RunSummary, checkers: CheckerSummary[]): string {
  const fastest = checkers[0]!;
  const ref = checkers.find(c => c.id === run.reference);
  const agree = run.parity.filter(p => p.differs === 0 && p.failed === 0).length;
  const lightest = [...checkers].sort((a, b) => a.rssMiB - b.rssMiB)[0]!;
  return `<section class="hero">
    <p class="eyebrow">${esc(run.label)} · ${esc(day(run.date))}</p>
    <h1 class="headline"><span style="color:${familyColor(fastest.family)}">${esc(short(fastest.id))}</span> checks ${esc(run.label)}
      ${fastest.id === run.reference ? 'fastest' : `<span class="accent">${times(fastest.speedup)}</span> faster than ${esc(short(run.reference))}`}</h1>
    <p class="sub">${run.configs.checked} configs, one after another, median of ${run.rounds} rounds on ${esc(run.machine.cpu)}.</p>
    <div class="tiles">
      ${tile('Fastest pass', secs(fastest.median), esc(short(fastest.id)), familyColor(fastest.family))}
      ${ref ? tile('Reference pass', secs(ref.median), esc(short(ref.id)), familyColor(ref.family)) : ''}
      ${tile('Lightest peak', mib(lightest.rssMiB), esc(short(lightest.id)), familyColor(lightest.family))}
      ${tile('Same diagnostics', `${agree}<span class="tile-of">/${run.parity.length}</span>`, 'checkers agree with the reference')}
    </div>
  </section>`;
}

function segmented(id: string, options: [string, string][], active: string): string {
  return `<div class="segmented" role="tablist" id="${id}">${options
    .map(([value, label]) => `<button type="button" role="tab" data-value="${esc(value)}" aria-selected="${value === active}">${esc(label)}</button>`)
    .join('')}</div>`;
}

function legend(families: string[]): string {
  return `<div class="legend">${families.map(f => `<span class="legend-item"><span class="swatch" style="background:${familyColor(f)}"></span>${esc(f)}</span>`).join('')}</div>`;
}

function numbersTable(run: RunSummary, checkers: CheckerSummary[]): string {
  const top = Math.max(...checkers.map(c => c.speedup).filter(Number.isFinite));
  return `<div class="table-scroll"><table class="data">
    <thead><tr><th>Checker</th><th class="num">Wall</th><th>vs reference</th><th class="num">CPU</th><th class="num">Peak</th></tr></thead>
    <tbody>${checkers
      .map(
        c => `<tr>
        <td><span class="swatch" style="background:${familyColor(c.family)}"></span><span title="${esc(c.id)}">${esc(short(c.id))}</span></td>
        <td class="num strong" title="${secs(c.min)} to ${secs(c.max)} over ${run.rounds} rounds">${secs(c.median)}</td>
        <td><div class="meter"><span style="width:${((c.speedup / top) * 100).toFixed(1)}%;background:${familyColor(c.family)}"></span></div><span class="meter-value">${times(c.speedup)}</span></td>
        <td class="num">${secs(c.cpu)}</td>
        <td class="num">${mib(c.rssMiB)}</td></tr>`
      )
      .join('')}</tbody></table></div>`;
}

function parityTable(run: RunSummary): string {
  const status = (p: RunSummary['parity'][number]) =>
    p.failed ? ['bad', 'Failed'] : p.differs ? ['warn', 'Differs'] : p.sameNormalized ? ['ok', 'Same errors'] : ['ok', 'Identical'];
  return `<div class="table-scroll"><table class="data">
    <thead><tr><th>Checker</th><th>Result</th><th class="num">Identical</th><th class="num">Same after normalizing</th><th class="num">Differs</th><th class="num">Failed</th><th class="num">Extra</th><th class="num">Missing</th></tr></thead>
    <tbody>${run.parity
      .map(p => {
        const [kind, label] = status(p);
        return `<tr><td><span class="swatch" style="background:${familyColor(familyOf(p.id))}"></span>${esc(short(p.id))}</td>
          <td><span class="chip ${kind}">${kind === 'ok' ? '✓' : '!'} ${label}</span></td>
          <td class="num">${p.identical}</td><td class="num">${p.sameNormalized}</td><td class="num">${p.differs}</td>
          <td class="num">${p.failed}</td><td class="num">${p.extra}</td><td class="num">${p.missing}</td></tr>`;
      })
      .join('')}</tbody></table></div>`;
}

// ---------------------------------------------------------------------------- charts

/** Horizontal bars, fastest on top, a min-to-max whisker on wall time, direct labels. */
function barsChart(run: RunSummary, checkers: CheckerSummary[], metric: Metric) {
  const c = ink();
  const n = isNarrow();
  const value = (x: CheckerSummary) => (metric === 'wall' ? x.median : metric === 'cpu' ? x.cpu : x.rssMiB);
  const fmt = (v: number) => (metric === 'memory' ? mib(v) : secs(v));
  const rows = [...checkers].sort((a, b) => value(a) - value(b)).reverse();
  return {
    grid: { left: 8, right: n ? 64 : 120, top: 8, bottom: 24, containLabel: true },
    xAxis: valueAxis(undefined, v => fmt(v)),
    yAxis: categoryAxis(rows.map(r => short(r.id)), { axisLabel: { color: c.secondary, fontSize: n ? 10 : 12 } }),
    tooltip: {
      trigger: 'axis',
      // No shadow: in the SVG renderer it paints over the bars and hides their color.
      axisPointer: { type: 'none' },
      formatter: (params: { dataIndex: number }[]) => {
        const r = rows[params[0]!.dataIndex]!;
        return `<b>${esc(r.id)}</b><br>Wall ${secs(r.median)} (${secs(r.min)} to ${secs(r.max)})<br>CPU ${secs(r.cpu)} · Peak ${mib(r.rssMiB)}<br>${times(r.speedup)} vs ${esc(short(run.reference))}`;
      },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 18,
        data: rows.map(r => ({ value: value(r), itemStyle: { color: familyColor(r.family), borderRadius: [0, 4, 4, 0] } })),
        // Hover keeps the family color and adds an outline in the text color.
        emphasis: { focus: 'none', itemStyle: { borderColor: c.primary, borderWidth: 1.5 } },
        label: {
          show: true,
          position: 'right',
          distance: n ? 6 : metric === 'wall' ? 14 : 6,
          color: c.primary,
          fontSize: n ? 10 : 11,
          formatter: (p: { dataIndex: number }) => {
            const r = rows[p.dataIndex]!;
            // On phones the speedup suffix is dropped to fit; the Numbers table still carries it.
            return metric === 'wall' && !n ? `${fmt(value(r))}  {muted|${times(r.speedup)}}` : fmt(value(r));
          },
          rich: { muted: { color: c.muted, fontSize: n ? 10 : 11 } },
        },
      },
      ...(metric === 'wall'
        ? [
            {
              type: 'custom',
              silent: true,
              z: 3,
              data: rows.map((r, i) => [i, r.min, r.max]),
              renderItem: (_: unknown, api: { value: (i: number) => number; coord: (p: number[]) => number[] }) => {
                const [x0, y] = api.coord([api.value(1), api.value(0)]);
                const [x1] = api.coord([api.value(2), api.value(0)]);
                return {
                  type: 'group',
                  children: [
                    { type: 'line', shape: { x1: x0, y1: y, x2: x1, y2: y }, style: { stroke: c.primary, lineWidth: 1.5, opacity: 0.55 } },
                    { type: 'line', shape: { x1: x1, y1: y! - 4, x2: x1, y2: y! + 4 }, style: { stroke: c.primary, lineWidth: 1.5, opacity: 0.55 } },
                  ],
                };
              },
            },
          ]
        : []),
    ],
  };
}

/** Groups checkers whose wall time and peak memory are both within 10% of each other. */
function clusters(list: CheckerSummary[]): CheckerSummary[][] {
  const near = (a: number, b: number) => Math.abs(a - b) / Math.max(a, b) < 0.1;
  const groups: CheckerSummary[][] = [];
  for (const x of list) {
    const home = groups.find(g => near(g[0]!.median, x.median) && near(g[0]!.rssMiB, x.rssMiB));
    if (home) home.push(x);
    else groups.push([x]);
  }
  return groups;
}

/** Wall time against peak memory: down and to the left is better. */
function scatterChart(checkers: CheckerSummary[]) {
  const c = ink();
  const n = isNarrow();
  const families = FAMILIES.filter(f => checkers.some(x => x.family === f));
  return {
    // Narrow puts labels above points, so the right margin can shrink instead of reserving label room.
    grid: { left: 8, right: n ? 12 : 24, top: n ? 32 : 28, bottom: 8, containLabel: true },
    // Log scale: one slow checker would otherwise squeeze every other point into a corner.
    xAxis: { ...valueAxis(n ? 'Wall per pass' : 'Wall per pass (log scale)', v => secs(v)), type: 'log', logBase: 10, nameLocation: 'middle', nameGap: 26 },
    yAxis: { ...valueAxis('Peak memory', v => mib(v)), scale: true },
    tooltip: {
      trigger: 'item',
      formatter: (p: { data: { id: string; value: number[] } }) => `<b>${esc(p.data.id)}</b><br>${secs(p.data.value[0]!)} · ${mib(p.data.value[1]!)}`,
    },
    series: families.map(f => ({
      type: 'scatter',
      name: f,
      symbolSize: n ? 11 : 14,
      itemStyle: { color: familyColor(f), borderColor: c.surface, borderWidth: 2 },
      // Versions of one family often land on top of each other. Points within 10%
      // on both axes share one label, at the first of them; the tooltip has each.
      data: clusters(checkers.filter(x => x.family === f)).flatMap(group =>
        group.map((x, i) => ({
          id: x.id,
          value: [x.median, x.rssMiB],
          label: {
            show: i === 0,
            position: n ? 'top' : 'right',
            color: c.secondary,
            fontSize: n ? 10 : 11,
            formatter: () => `${f} ${group.map(a => shortVersion(versionOf(a.id))).join(', ')}`,
          },
        }))
      ),
    })),
  };
}

/** One family's speedup against the reference by version, newest run per version. */
function trendChart(family: string, points: [string, number][]) {
  const c = ink();
  const color = familyColor(family);
  return {
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: categoryAxis(points.map(p => shortVersion(p[0])), { boundaryGap: points.length === 1 }),
    yAxis: { ...valueAxis(undefined, v => `${v}×`), min: 0 },
    tooltip: { trigger: 'axis', formatter: (p: { dataIndex: number }[]) => `<b>${esc(family)}@${esc(points[p[0]!.dataIndex]![0])}</b><br>${times(points[p[0]!.dataIndex]![1])} vs reference` },
    series: [
      {
        type: 'line',
        data: points.map(p => p[1]),
        lineStyle: { width: 2, color },
        itemStyle: { color, borderColor: c.surface, borderWidth: 2 },
        symbolSize: 9,
        label: { show: true, position: 'top', color: c.primary, fontSize: 11, formatter: (p: { value: number }) => times(p.value) },
        areaStyle: { color, opacity: 0.08 },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: c.muted, type: 'dashed', width: 1 },
          label: { formatter: 'reference', color: c.muted, fontSize: 10, position: 'insideStartBottom' },
          data: [{ yAxis: 1 }],
        },
      },
    ],
  };
}

function trendData(run: RunSummary): [string, [string, number][]][] {
  // Speedups are only comparable against the same reference, on the same platform and source.
  const related = runs.filter(
    r => r.label === run.label && r.machine.platform === run.machine.platform && r.source.kind === run.source.kind && r.reference === run.reference
  );
  const byFamily = new Map<string, Map<string, number>>();
  // Oldest first, so the newest run of each version wins.
  for (const r of [...related].reverse()) {
    for (const c of r.settings.find(s => s.threads === 'default')?.checkers ?? []) {
      if (!byFamily.has(c.family)) byFamily.set(c.family, new Map());
      byFamily.get(c.family)!.set(versionOf(c.id), c.speedup);
    }
  }
  return FAMILIES.filter(f => byFamily.has(f)).map(f => [f, [...byFamily.get(f)!.entries()].sort((a, b) => compareVersions(a[0], b[0]))]);
}

/** Newest run per platform for this target; speedup against each run's own reference. */
function platformData(run: RunSummary): RunSummary[] {
  const newest = new Map<string, RunSummary>();
  for (const r of runs.filter(r => r.label === run.label)) if (!newest.has(r.machine.platform)) newest.set(r.machine.platform, r);
  return [...newest.values()];
}

function platformChart(list: RunSummary[]) {
  const c = ink();
  const n = isNarrow();
  const ids = [...new Set(list.flatMap(r => r.settings.find(s => s.threads === 'default')?.checkers.map(x => x.id) ?? []))].sort();
  // Reserve room for the legend above the plot; it wraps to two or three rows with
  // several platforms, and a too-small top margin lets those rows land on the bars.
  const legendRows = Math.max(1, Math.ceil(list.length / (n ? 2 : 4)));
  const top = 16 + legendRows * 22;
  return {
    grid: { left: 8, right: 16, top, bottom: 8, containLabel: true },
    legend: { top: 0, itemGap: 16, textStyle: { color: c.secondary, fontSize: n ? 11 : 12 } },
    xAxis: categoryAxis(ids.map(short), { axisLabel: { color: c.secondary, rotate: n ? 45 : 30, fontSize: n ? 10 : 12, interval: 0 } }),
    yAxis: valueAxis(undefined, v => `${v}×`),
    tooltip: { trigger: 'axis', axisPointer: { type: 'none' } },
    series: list.map((r, i) => ({
      type: 'bar',
      name: r.machine.platform,
      barMaxWidth: 14,
      emphasis: { focus: 'none', itemStyle: { borderColor: c.primary, borderWidth: 1.5 } },
      itemStyle: { color: ['#2a78d6', '#eb6834', '#1baf7a'][i % 3], borderRadius: [4, 4, 0, 0] },
      data: ids.map(id => r.settings.find(s => s.threads === 'default')?.checkers.find(x => x.id === id)?.speedup ?? null),
    })),
  };
}

// ---------------------------------------------------------------------------- run picker

const searchText = (r: RunSummary): string =>
  [r.label, r.machine.platform, r.machine.cpu, r.machine.os, where(r), day(r.date), r.id, `node ${r.machine.node}`].join(' ').toLowerCase();

/** Runs grouped by calendar day, in the order of `runs`: newest day first. */
function byDay(list: RunSummary[]): [string, RunSummary[]][] {
  const groups = new Map<string, RunSummary[]>();
  for (const r of list) {
    const key = day(r.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return [...groups];
}

const icon = {
  chevron: `<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg class="check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  search: `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  cross: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  method: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1.75H4.5A1.5 1.5 0 0 0 3 3.25v9.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5V5.5L9 1.75Z"/><path d="M9 1.75V5.5h3.75"/><path d="M5.75 8.5h4.5M5.75 10.75h4.5"/></svg>`,
};

const platformTag = (r: RunSummary): string => `<span class="platform">${esc(r.machine.platform)}</span>`;

/** A searchable run picker: a trigger showing the current run, and a popover listing every run by day. */
function runPicker(current: RunSummary): string {
  let index = 0;
  const option = (r: RunSummary): string => `<button type="button" role="option" class="option" id="run-option-${index++}" data-id="${esc(r.id)}" data-search="${esc(searchText(r))}" aria-selected="${r.id === current.id}">
    <span class="option-text">
      <span class="option-main">${esc(r.label)}${platformTag(r)}<span class="source ${esc(r.source.kind)}">${r.source.kind === 'ci' ? 'CI' : 'Local'}</span></span>
      <span class="option-sub">${esc(r.machine.cpu)} · ${r.machine.cores} cores · ${esc(r.machine.os)}${r.source.kind === 'ci' && r.source.runner ? ` · ${esc(r.source.runner)}` : ''}</span>
    </span>
    ${icon.check}
  </button>`;
  const group = ([date, list]: [string, RunSummary[]], g: number): string => `<div class="group" role="group" aria-labelledby="run-group-${g}">
    <div class="group-head">
      <span class="group-date" id="run-group-${g}">${esc(date)}</span>
      <span class="group-count">${list.length} run${list.length === 1 ? '' : 's'}</span>
      ${list.length > 1 ? `<button type="button" class="compare-button">Compare</button>` : ''}
    </div>
    ${list.map(option).join('')}
  </div>`;
  return `<div class="run-picker" id="run">
    <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="run-list">
      <span class="trigger-text">
        <span class="trigger-main">${esc(current.label)}${platformTag(current)}</span>
        <span class="trigger-sub">${esc(where(current))} · ${esc(current.machine.cpu)} · ${esc(day(current.date))}</span>
      </span>
      ${icon.chevron}
    </button>
    <div class="popover" hidden>
      <label class="search">${icon.search}<input type="text" placeholder="Search by project, platform, CPU or date" aria-label="Search runs" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="run-list" aria-autocomplete="list" /></label>
      <div class="list" role="listbox" id="run-list" aria-label="Runs">${byDay(runs).map(group).join('')}</div>
      <p class="empty" hidden>No runs match.</p>
    </div>
  </div>`;
}

/** Open, filter, keyboard and selection for the picker rendered by `runPicker`. */
function wireRunPicker(app: HTMLElement): void {
  const picker = app.querySelector<HTMLElement>('#run')!;
  const trigger = picker.querySelector<HTMLButtonElement>('.trigger')!;
  const popover = picker.querySelector<HTMLElement>('.popover')!;
  const input = picker.querySelector<HTMLInputElement>('input')!;
  const empty = picker.querySelector<HTMLElement>('.empty')!;
  const visible = () => [...picker.querySelectorAll<HTMLButtonElement>('.option:not([hidden])')];
  let active = -1;

  const highlight = (i: number): void => {
    const list = visible();
    active = list.length ? ((i % list.length) + list.length) % list.length : -1;
    list.forEach((o, k) => o.classList.toggle('active', k === active));
    const current = list[active];
    if (current) {
      current.scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', current.id);
    } else input.removeAttribute('aria-activedescendant');
  };
  const filter = (): void => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const o of picker.querySelectorAll<HTMLElement>('.option')) o.hidden = !words.every(w => o.dataset['search']!.includes(w));
    for (const g of picker.querySelectorAll<HTMLElement>('.group')) {
      const shown = g.querySelectorAll('.option:not([hidden])').length;
      g.hidden = shown === 0;
      // Compare covers the runs still listed under the day, so it needs two of them.
      const button = g.querySelector<HTMLElement>('.compare-button');
      if (button) button.hidden = shown < 2;
    }
    const list = visible();
    empty.hidden = list.length > 0;
    highlight(Math.max(0, list.findIndex(o => o.getAttribute('aria-selected') === 'true')));
  };
  const open = (): void => {
    popover.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    input.value = '';
    filter();
    input.focus();
  };
  const close = (): void => {
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.onclick = () => (popover.hidden ? open() : close());
  trigger.onkeydown = e => {
    if (e.key === 'ArrowDown' && popover.hidden) {
      e.preventDefault();
      open();
    }
  };
  input.oninput = filter;
  input.onkeydown = e => {
    const moves: Record<string, () => void> = {
      ArrowDown: () => highlight(active + 1),
      ArrowUp: () => highlight(active - 1),
      Home: () => highlight(0),
      End: () => highlight(-1),
      Enter: () => visible()[active]?.click(),
      Escape: () => {
        close();
        trigger.focus();
      },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    move();
  };
  popover.onclick = e => {
    const target = e.target as HTMLElement;
    const option = target.closest<HTMLElement>('.option');
    const compare = target.closest<HTMLElement>('.compare-button');
    if (option) {
      state.runId = option.dataset['id']!;
      render();
    } else if (compare) {
      const group = compare.closest<HTMLElement>('.group')!;
      state.compare = [...group.querySelectorAll<HTMLElement>('.option:not([hidden])')].map(o => o.dataset['id']!);
      render();
    }
  };
}

// A click anywhere else closes the picker. The page re-renders its markup, so the picker is looked up each time.
document.addEventListener('pointerdown', e => {
  const picker = document.querySelector<HTMLElement>('#run');
  if (!picker || picker.contains(e.target as Node)) return;
  picker.querySelector<HTMLElement>('.popover')!.hidden = true;
  picker.querySelector('.trigger')!.setAttribute('aria-expanded', 'false');
});

// ---------------------------------------------------------------------------- compare

const COMPARE_METRICS: [CompareMetric, string][] = [
  ['speedup', 'Speedup'],
  ['wall', 'Wall time'],
  ['cpu', 'CPU time'],
  ['memory', 'Peak memory'],
];
const RUN_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#c98500', '#d55181', '#13a3b8', '#8a8a85'];
const runColor = (i: number): string => RUN_COLORS[i % RUN_COLORS.length]!;

const defaultCheckers = (r: RunSummary): CheckerSummary[] => r.settings.find(s => s.threads === 'default')?.checkers ?? r.settings[0]?.checkers ?? [];

const compareValue = (c: CheckerSummary, metric: CompareMetric): number =>
  metric === 'speedup' ? c.speedup : metric === 'wall' ? c.median : metric === 'cpu' ? c.cpu : c.rssMiB;
const compareFormat = (v: number, metric: CompareMetric): string => (metric === 'speedup' ? times(v) : metric === 'memory' ? mib(v) : secs(v));

/** Checker ids present in any of the runs, in family order, then by version. */
function compareIds(list: RunSummary[]): string[] {
  const rank = (id: string) => FAMILIES.indexOf(familyOf(id) as (typeof FAMILIES)[number]);
  return [...new Set(list.flatMap(r => defaultCheckers(r).map(c => c.id)))].sort((a, b) => rank(a) - rank(b) || compareVersions(versionOf(a), versionOf(b)));
}

/** "vite · darwin-arm64", with the CPU, then the source and day, added only when two runs would otherwise share a name. */
function compareNames(list: RunSummary[]): string[] {
  const extend = (names: string[], more: (r: RunSummary) => string): string[] =>
    names.map((n, i) => (names.filter(x => x === n).length > 1 ? `${n} · ${more(list[i]!)}` : n));
  const base = list.map(r => `${r.label} · ${r.machine.platform}`);
  return extend(extend(base, r => r.machine.cpu), r => `${where(r)} · ${day(r.date)}`);
}

function compareSection(list: RunSummary[]): string {
  const ids = compareIds(list);
  const names = compareNames(list);
  const metric = state.compareMetric;
  const better = metric === 'speedup' ? Math.max : Math.min;
  const days = [...new Set(list.map(r => day(r.date)))];
  const when = days.length === 1 ? days[0]! : `${days[days.length - 1]} to ${days[0]}`;
  const row = (id: string): string => {
    const cells = list.map(r => defaultCheckers(r).find(c => c.id === id));
    const values = cells.map(c => (c ? compareValue(c, metric) : NaN)).filter(Number.isFinite);
    const best = values.length ? better(...values) : NaN;
    return `<tr><td><span class="swatch" style="background:${familyColor(familyOf(id))}"></span><span title="${esc(id)}">${esc(short(id))}</span></td>${cells
      .map(c => {
        const v = c ? compareValue(c, metric) : NaN;
        return `<td class="num${v === best ? ' best' : ''}">${Number.isFinite(v) ? compareFormat(v, metric) : '<span class="muted">n/a</span>'}</td>`;
      })
      .join('')}</tr>`;
  };
  return `<section class="card compare-panel">
    <div class="card-head">
      <div><h2>Compare ${list.length} runs</h2><p class="hint">${esc(when)}. Checkers as shipped. Speedups are against each run's own reference, so compare ratios across machines and seconds within one.</p></div>
      <div class="compare-actions">${segmented('compare-metric', COMPARE_METRICS, metric)}<button type="button" class="close" id="compare-close" aria-label="Close comparison">${icon.cross}</button></div>
    </div>
    <div class="compare-runs">${list
      .map((r, i) => `<span class="compare-run"><span class="swatch" style="background:${runColor(i)}"></span>${esc(names[i]!)}<span class="muted"> · ${esc(where(r))} · ${esc(r.machine.cpu)}</span></span>`)
      .join('')}</div>
    <div class="chart" id="chart-compare" style="height:340px"></div>
    <div class="table-scroll"><table class="data compare-table">
      <thead><tr><th>Checker</th>${list
        .map((r, i) => `<th class="num run-head" title="${esc(names[i]!)}"><span class="swatch" style="background:${runColor(i)}"></span>${esc(r.machine.platform)}<span class="sub">${esc(r.machine.cpu)}</span></th>`)
        .join('')}</tr></thead>
      <tbody>${ids.map(row).join('')}</tbody></table></div>
  </section>`;
}

/** Grouped bars: one group per checker, one bar per run. */
function compareChart(list: RunSummary[], metric: CompareMetric) {
  const c = ink();
  const n = isNarrow();
  const ids = compareIds(list);
  const names = compareNames(list);
  type Param = { seriesName: string; dataIndex: number; value: number | null; marker: string };
  return {
    // The run list above the chart is the legend.
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    xAxis: categoryAxis(ids.map(short), { axisLabel: { color: c.secondary, rotate: n ? 45 : 30, fontSize: n ? 10 : 12, interval: 0 } }),
    yAxis: valueAxis(undefined, v => (metric === 'speedup' ? `${v}×` : compareFormat(v, metric))),
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      formatter: (params: Param[]) =>
        `<b>${esc(ids[params[0]!.dataIndex]!)}</b><br>${params.map(p => `${p.marker}${esc(p.seriesName)}: ${p.value == null ? 'n/a' : compareFormat(p.value, metric)}`).join('<br>')}`,
    },
    series: list.map((r, i) => ({
      type: 'bar',
      name: names[i],
      barMaxWidth: 14,
      emphasis: { focus: 'none', itemStyle: { borderColor: c.primary, borderWidth: 1.5 } },
      itemStyle: { color: runColor(i), borderRadius: [4, 4, 0, 0] },
      data: ids.map(id => {
        const x = defaultCheckers(r).find(k => k.id === id);
        return x ? compareValue(x, metric) : null;
      }),
    })),
  };
}

// ---------------------------------------------------------------------------- page

function render(): void {
  disposeAll();
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const brand = `<header class="topbar"><div class="brand"><span class="brand-mark">tsc</span>ts-check-arena</div>
    <a class="topbar-link" href="https://github.com/relliv/ts-check-arena/blob/main/docs/METHOD.md">${icon.method}Method</a></header>`;
  const run = runs.find(r => r.id === state.runId);
  if (!run) {
    app.innerHTML = `${brand}<div class="empty"><h2>No published runs yet</h2><p>Run <code>pnpm arena run</code>, then publish a run or let CI commit results.</p></div>`;
    return;
  }
  const settings = run.settings.map(s => s.threads);
  if (!settings.includes(state.threads)) state.threads = settings[0] ?? 'default';
  const checkers = run.settings.find(s => s.threads === state.threads)!.checkers;
  const families = FAMILIES.filter(f => checkers.some(c => c.family === f));
  const trends = trendData(run);
  const platforms = platformData(run);
  const compared = state.compare ? runs.filter(r => state.compare!.includes(r.id)) : [];

  app.innerHTML = `${brand}
    <div class="controls">
      <div class="field"><span>Run</span>${runPicker(run)}</div>
      ${settings.length > 1 ? `<div class="field"><span>Threads</span>${segmented('threads', settings.map(t => [t, t === 'default' ? 'As shipped' : `${t}`]), state.threads)}</div>` : ''}
    </div>
    ${compared.length ? compareSection(compared) : ''}
    ${hero(run, checkers)}
    <div class="meta">
      <span class="badge ${run.source.kind}">${esc(where(run))}</span>
      <span class="badge">${esc(run.machine.cpu)} · ${run.machine.cores} cores · ${run.machine.memoryGiB} GiB</span>
      <span class="badge">${esc(run.machine.os)}</span>
      <span class="badge">Node ${esc(run.machine.node)}</span>
      ${run.configs.shadowed ? `<span class="badge">${run.configs.shadowed} shadow configs</span>` : ''}
      ${run.configs.rejected ? `<span class="badge warn">${run.configs.rejected} configs rejected</span>` : ''}
    </div>

    <section class="card">
      <div class="card-head">
        <div><h2>Per pass</h2><p class="hint">Every config checked once, one after another. Bars are medians; the line spans the fastest to the slowest round.</p></div>
        ${segmented('metric', [['wall', 'Wall time'], ['cpu', 'CPU time'], ['memory', 'Peak memory']], state.metric)}
      </div>
      ${legend(families)}
      <div class="chart" id="chart-bars" style="height:${Math.max(240, checkers.length * 40 + 48)}px"></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h2>Speed and memory</h2><p class="hint">Down and to the left is better.</p>
        <div class="chart" id="chart-scatter" style="height:320px"></div>
      </section>
      <section class="card">
        <h2>Numbers</h2><p class="hint">Median of ${run.rounds} rounds after one warm-up, against ${esc(short(run.reference))}. Hover a wall time for its range.</p>
        ${numbersTable(run, checkers)}
        ${run.unavailable.length ? `<p class="hint">No build for ${esc(run.machine.platform)}: ${esc(run.unavailable.map(short).join(', '))}.</p>` : ''}
        ${run.untimed.length ? `<p class="hint">Not timed, failed on a config: ${esc(run.untimed.map(short).join(', '))}.</p>` : ''}
      </section>
    </div>

    <section class="card">
      <h2>Across versions</h2>
      <p class="hint">Speedup against the reference for every version measured on ${esc(run.label)}, ${esc(run.machine.platform)}. The dashed line is the reference.</p>
      <div class="trends">${trends
        .map(([family]) => `<div class="trend"><div class="trend-name"><span class="swatch" style="background:${familyColor(family)}"></span>${esc(family)}</div><div class="chart" data-trend="${esc(family)}" style="height:170px"></div></div>`)
        .join('')}</div>
    </section>

    ${
      platforms.length > 1
        ? `<section class="card"><h2>Across platforms</h2><p class="hint">Newest run per platform; each bar is the speedup against that run's own reference. Compare ratios, not seconds.</p><div class="chart" id="chart-platforms" style="height:${340 + Math.max(0, Math.ceil(platforms.length / (isNarrow() ? 2 : 4)) - 1) * 22}px"></div></section>`
        : ''
    }

    <section class="card">
      <h2>Diagnostics</h2>
      <p class="hint">Each checker's output on all ${run.configs.checked} configs, compared with ${esc(short(run.reference))}.</p>
      ${parityTable(run)}
    </section>

    <footer class="footer">Raw records: <code>results/${esc(run.id)}/</code> (run.json, timing.csv, parity.json). Method: <a href="https://github.com/relliv/ts-check-arena/blob/main/docs/METHOD.md">docs/METHOD.md</a>.</footer>`;

  mount(app.querySelector('#chart-bars'), barsChart(run, checkers, state.metric));
  mount(app.querySelector('#chart-scatter'), scatterChart(checkers));
  for (const [family, points] of trends) mount(app.querySelector(`[data-trend="${family}"]`), trendChart(family, points));
  if (platforms.length > 1) mount(app.querySelector('#chart-platforms'), platformChart(platforms));
  if (compared.length) mount(app.querySelector('#chart-compare'), compareChart(compared, state.compareMetric));

  wireRunPicker(app);
  app.querySelector('#compare-close')?.addEventListener('click', () => {
    state.compare = null;
    render();
  });
  for (const [id, key] of [['threads', 'threads'], ['metric', 'metric'], ['compare-metric', 'compareMetric']] as const) {
    app.querySelector(`#${id}`)?.addEventListener('click', e => {
      const value = (e.target as HTMLElement).closest('button')?.dataset['value'];
      if (!value) return;
      (state as unknown as Record<string, string>)[key] = value;
      render();
    });
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
// Crossing the phone-width breakpoint re-renders so charts pick up their narrow layout.
window.matchMedia('(max-width: 640px)').addEventListener('change', render);
render();
