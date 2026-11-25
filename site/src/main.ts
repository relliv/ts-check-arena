// The arena site: every published run, read from results/*/summary.json and from
// the data branch at build time. No framework; the page re-renders from state on
// every change.
import type { CheckerSummary, RunSummary } from '../../src/lib/report.ts';
import dataBranch from 'virtual:arena-data';
import { FAMILIES, categoryAxis, disposeAll, familyColor, ink, isNarrow, mount, valueAxis } from './charts.ts';
import { mountLibs } from './libs.ts';
import { checkerName, mountVariantPopover } from './variants.ts';
import corpusFile from '../../corpus.json' with { type: 'json' };

declare const __ARENA_PRIVATE__: boolean;

const published = import.meta.glob<RunSummary>('../../results/*/summary.json', { eager: true, import: 'default' });
const local = import.meta.glob<RunSummary>('../../results/private/*/summary.json', { eager: true, import: 'default' });
// A run can be both checked out and on the data branch; the checkout wins.
const runs: RunSummary[] = [
  ...new Map([...dataBranch, ...Object.values(published), ...(__ARENA_PRIVATE__ ? Object.values(local) : [])].map(r => [r.id, r])).values(),
].sort((a, b) => b.date.localeCompare(a.date));

type Metric = 'wall' | 'cpu' | 'memory';

type CompareMetric = 'speedup' | Metric;

/** `?run=<id>` names the run on screen, so a refresh or a shared link opens the same one. Unknown ids fall back to the newest. */
const RUN_PARAM = 'run';
const linkedRun = new URL(location.href).searchParams.get(RUN_PARAM);
// A link to a run that no longer exists drops the parameter instead of keeping a stale one.
if (linkedRun !== null && !runs.some(r => r.id === linkedRun)) {
  const url = new URL(location.href);
  url.searchParams.delete(RUN_PARAM);
  history.replaceState(history.state, '', url);
}

/**
 * How the compare table's rows are ordered: by checker name, or by one run's column
 * (its index), best first or worst first. Null keeps family order.
 */
type CompareSort = { by: 'checker' | number; reverse: boolean } | null;

const state: {
  runId: string;
  threads: string;
  metric: Metric;
  compare: string[] | null;
  compareMetric: CompareMetric;
  compareSort: CompareSort;
} = {
  runId: runs.find(r => r.id === linkedRun)?.id ?? runs[0]?.id ?? '',
  threads: 'default',
  metric: 'wall',
  // Runs shown side by side, from a day's Compare button; null hides the panel.
  compare: null,
  compareMetric: 'speedup',
  compareSort: null,
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

/** A checker's name as HTML, with a variant suffix (+fast) as a tag that explains it. */
const nameHtml = (id: string): string => checkerName(id, short);

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
    <h1 class="headline"><span style="color:${familyColor(fastest.family)}">${nameHtml(fastest.id)}</span> checks ${esc(run.label)}
      ${fastest.id === run.reference ? 'fastest' : `<span class="accent">${times(fastest.speedup)}</span> faster than ${esc(short(run.reference))}`}</h1>
    <p class="sub">${run.configs.checked} configs, one after another, median of ${run.rounds} rounds on ${esc(run.machine.cpu)}.</p>
    <div class="tiles">
      ${tile('Fastest pass', secs(fastest.median), nameHtml(fastest.id), familyColor(fastest.family))}
      ${ref ? tile('Reference pass', secs(ref.median), esc(short(ref.id)), familyColor(ref.family)) : ''}
      ${tile('Lightest peak', mib(lightest.rssMiB), nameHtml(lightest.id), familyColor(lightest.family))}
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
  return `<div class="table-scroll" data-scroll="numbers"><table class="data">
    <thead><tr><th>Checker</th><th class="num">Wall</th><th>vs reference</th><th class="num">CPU</th><th class="num">Peak</th></tr></thead>
    <tbody>${checkers
      .map(
        c => `<tr>
        <td><span class="swatch" style="background:${familyColor(c.family)}"></span><span title="${esc(c.id)}">${nameHtml(c.id)}</span>${
          // A fixed baseline (tsc 6) is timed once: it places the others and is not compared closely.
          c.runs < run.rounds ? `<span class="baseline-tag" title="Timed in ${c.runs} ${c.runs === 1 ? 'round' : 'rounds'}, without a warm-up of its own: a fixed baseline that places the other checkers">baseline</span>` : ''
        }</td>
        <td class="num strong" title="${c.runs < run.rounds ? `${c.runs} ${c.runs === 1 ? 'round' : 'rounds'}, baseline` : `${secs(c.min)} to ${secs(c.max)} over ${run.rounds} rounds`}">${secs(c.median)}</td>
        <td><div class="meter"><span style="width:${((c.speedup / top) * 100).toFixed(1)}%;background:${familyColor(c.family)}"></span></div><span class="meter-value">${times(c.speedup)}</span></td>
        <td class="num">${secs(c.cpu)}</td>
        <td class="num">${mib(c.rssMiB)}</td></tr>`
      )
      .join('')}</tbody></table></div>`;
}

function parityTable(run: RunSummary): string {
  const status = (p: RunSummary['parity'][number]) =>
    p.failed ? ['bad', 'Failed'] : p.differs ? ['warn', 'Differs'] : p.sameNormalized ? ['ok', 'Same errors'] : ['ok', 'Identical'];
  return `<div class="table-scroll" data-scroll="diagnostics"><table class="data">
    <thead><tr><th>Checker</th><th>Result</th><th class="num">Identical</th><th class="num">Same after normalizing</th><th class="num">Differs</th><th class="num">Failed</th><th class="num">Extra</th><th class="num">Missing</th></tr></thead>
    <tbody>${run.parity
      .map(p => {
        const [kind, label] = status(p);
        return `<tr><td><span class="swatch" style="background:${familyColor(familyOf(p.id))}"></span>${nameHtml(p.id)}</td>
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
    grid: { left: 4, right: n ? 56 : 120, top: 8, bottom: n ? 16 : 24, containLabel: true },
    // Phones get three ticks; five second-labels do not fit in 300px.
    xAxis: { ...valueAxis(undefined, v => fmt(v)), splitNumber: n ? 3 : 5, axisLabel: { color: c.muted, fontSize: n ? 10 : 12, hideOverlap: true, formatter: (v: number) => fmt(v) } },
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
          distance: metric === 'wall' ? 12 : 6,
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
    // containLabel leaves out axis names, so the bottom margin holds the x axis title.
    grid: { left: 8, right: n ? 12 : 24, top: n ? 32 : 28, bottom: 34, containLabel: true },
    // Log scale: one slow checker would otherwise squeeze every other point into a corner.
    // The range hugs the data instead of rounding out to whole powers of ten.
    xAxis: {
      ...valueAxis(n ? 'Wall per pass' : 'Wall per pass (log scale)', v => secs(v)),
      type: 'log',
      logBase: 10,
      min: (r: { min: number }) => r.min * 0.7,
      max: (r: { max: number }) => r.max * 1.5,
      // The padded ends are not round numbers; only the powers of ten get a label.
      axisLabel: { color: c.muted, showMinLabel: false, showMaxLabel: false, formatter: (v: number) => secs(v) },
      nameLocation: 'middle',
      nameGap: 26,
    },
    yAxis: { ...valueAxis('Peak memory', v => mib(v)), scale: true },
    tooltip: {
      trigger: 'item',
      formatter: (p: { data: { id: string; value: number[] } }) => `<b>${esc(p.data.id)}</b><br>${secs(p.data.value[0]!)} · ${mib(p.data.value[1]!)}`,
    },
    series: families.map(f => ({
      type: 'scatter',
      name: f,
      symbolSize: n ? 11 : 14,
      // Crowded labels are pushed apart vertically, and any that still collide are hidden; the tooltip names every point.
      labelLayout: { moveOverlap: 'shiftY', hideOverlap: true },
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
    xAxis: categoryAxis(points.map(p => shortVersion(p[0])), { boundaryGap: points.length === 1 || isNarrow() }),
    yAxis: { ...valueAxis(undefined, v => `${v}×`), min: 0, splitNumber: isNarrow() ? 3 : 5 },
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
          label: { show: !isNarrow(), formatter: 'reference', color: c.muted, fontSize: 10, position: 'insideStartBottom' },
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

const platformIds = (list: RunSummary[]): string[] =>
  [...new Set(list.flatMap(r => r.settings.find(s => s.threads === 'default')?.checkers.map(x => x.id) ?? []))].sort();

/** Legend rows plus the plot: fixed on wide screens, one row per checker on phones, where the bars run sideways. */
function platformHeight(list: RunSummary[]): number {
  const n = isNarrow();
  const legend = Math.max(0, Math.ceil(list.length / (n ? 2 : 4)) - 1) * 22;
  return n ? 60 + legend + platformIds(list).length * Math.max(24, list.length * 6 + 6) : 340 + legend;
}

function platformChart(list: RunSummary[]) {
  const c = ink();
  const n = isNarrow();
  const ids = platformIds(list);
  // Reserve room for the legend above the plot; it wraps to two or three rows with
  // several platforms, and a too-small top margin lets those rows land on the bars.
  const legendRows = Math.max(1, Math.ceil(list.length / (n ? 2 : 4)));
  const top = (n ? 8 : 16) + legendRows * 22;
  const checkerAxis = categoryAxis(ids.map(short), { axisLabel: { color: c.secondary, rotate: n ? 0 : 30, fontSize: n ? 10 : 12, interval: 0 }, inverse: n });
  const speedAxis = { ...valueAxis(undefined, v => `${v}×`), splitNumber: n ? 3 : 5 };
  return {
    grid: { left: 4, right: n ? 8 : 16, top, bottom: 8, containLabel: true },
    legend: { top: 0, itemGap: n ? 10 : 16, itemWidth: n ? 12 : 25, textStyle: { color: c.secondary, fontSize: n ? 11 : 12 } },
    xAxis: n ? speedAxis : checkerAxis,
    yAxis: n ? checkerAxis : speedAxis,
    tooltip: { trigger: 'axis', axisPointer: { type: 'none' } },
    series: list.map((r, i) => ({
      type: 'bar',
      name: r.machine.platform,
      barMaxWidth: n ? 5 : 14,
      emphasis: { focus: 'none', itemStyle: { borderColor: c.primary, borderWidth: 1.5 } },
      itemStyle: { color: RUN_COLORS[i % RUN_COLORS.length], borderRadius: n ? [0, 3, 3, 0] : [4, 4, 0, 0] },
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
  // The brand: a stopwatch with a check mark, for timed type checks. The favicon in index.html draws the same mark.
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.75h4M12 2.75v3"/><path d="M18.25 6.25l1.5-1.5"/><circle cx="12" cy="13.5" r="7.25"/><path d="M8.75 13.75l2.25 2.25 4.25-4.5"/></svg>`,
  chevron: `<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg class="check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  search: `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  cross: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  libs: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>`,
  info: `<svg class="note-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.75M8 5h.01"/></svg>`,
  repo: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 13V3.5a1.5 1.5 0 0 1 1.5-1.5h7.5v9.5H5a1.5 1.5 0 0 0-1.5 1.5Zm0 0A1.5 1.5 0 0 0 5 14.5h7.5"/><path d="M6 5h4"/></svg>`,
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
      selectRun(option.dataset['id']!);
    } else if (compare) {
      const group = compare.closest<HTMLElement>('.group')!;
      state.compare = [...group.querySelectorAll<HTMLElement>('.option:not([hidden])')].map(o => o.dataset['id']!);
      state.compareSort = null;
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
const RUN_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#c98500', '#d55181', '#13a3b8', '#8492a6'];
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

const pinned = (corpusFile as { projects: { name: string; repo: string; sha: string; description: string }[] }).projects;

/**
 * The public project a run checked. Newer summaries carry it; older CI runs, always
 * of a corpus project, fall back to the commit corpus.json pins, marked as such.
 * Local runs without the field may be private projects, so they get none.
 */
function projectFor(run: RunSummary): { repo: string; commit: string; description: string; fromPin: boolean } | null {
  if (run.project) return { ...run.project, fromPin: false };
  const p = run.source.kind === 'ci' ? pinned.find(x => x.name === run.label) : undefined;
  return p ? { repo: p.repo, commit: p.sha, description: p.description, fromPin: true } : null;
}

/** The project badge: owner/name at the short commit, linking to the tree that was checked. */
function projectBadge(run: RunSummary): string {
  const p = projectFor(run);
  if (!p) return '';
  const name = p.repo.replace(/^https:\/\/github\.com\//, '');
  return `<a class="badge project" href="${esc(p.repo)}/tree/${esc(p.commit)}" target="_blank" rel="noopener" aria-describedby="project-tip">
    ${icon.repo}<span>${esc(name)}</span><code>${esc(p.commit.slice(0, 7))}</code>
    <span class="project-tip" role="tooltip" id="project-tip"><b>${esc(name)}</b><span>${esc(p.description)}</span><span>${run.configs.checked} configs checked at ${esc(p.commit.slice(0, 12))}${p.fromPin ? ', the commit corpus.json pins' : ''}</span></span>
  </a>`;
}

/**
 * Shows a run and writes it to the address bar, keeping the rest of the URL (#libs
 * included). Replaced, not pushed: switching runs does not fill the back button.
 */
function selectRun(id: string): void {
  state.runId = id;
  const url = new URL(location.href);
  url.searchParams.set(RUN_PARAM, id);
  history.replaceState(history.state, '', url);
  render();
}

/**
 * For a run that is not the newest of its project on its platform: what the newest
 * one tests differently. Platforms are not mixed, since some checkers have no build
 * for some platforms and would show up as removed. Null when there is nothing to say.
 */
function versionNote(run: RunSummary): string | null {
  const newest = runs.find(r => r.label === run.label && r.machine.platform === run.machine.platform);
  if (!newest || newest.id === run.id) return null;
  const here = new Set(defaultCheckers(run).map(c => c.id));
  const there = new Set(defaultCheckers(newest).map(c => c.id));
  const added = [...there].filter(id => !here.has(id)).sort();
  const removed = [...here].filter(id => !there.has(id)).sort();
  const reference = newest.reference !== run.reference;
  if (!added.length && !removed.length && !reference && day(newest.date) === day(run.date)) return null;
  const list = (ids: string[], sign: string, kind: string) =>
    ids.length ? `<p class="note-line"><span class="note-label">${kind}</span>${ids.map(id => `<span class="note-chip ${sign === '+' ? 'added' : 'removed'}">${sign} ${esc(short(id))}</span>`).join('')}</p>` : '';
  return `<aside class="version-note" role="note">
    ${icon.info}
    <div class="note-body">
      <p><b>Older run (${esc(day(run.date))}).</b> The newest ${esc(run.label)} run on ${esc(run.machine.platform)} is from ${esc(day(newest.date))}.</p>
      ${list(added, '+', 'Added since')}${list(removed, '−', 'Dropped since')}
      ${reference ? `<p>The reference here is ${esc(short(run.reference))}; it is now ${esc(short(newest.reference))}, so speedups are not directly comparable.</p>` : ''}
    </div>
    <button type="button" class="note-action" data-run="${esc(newest.id)}">View newest</button>
  </aside>`;
}

function compareSection(list: RunSummary[]): string {
  const ids = compareIds(list);
  const names = compareNames(list);
  const metric = state.compareMetric;
  const better = metric === 'speedup' ? Math.max : Math.min;
  const days = [...new Set(list.map(r => day(r.date)))];
  const when = days.length === 1 ? days[0]! : `${days[days.length - 1]} to ${days[0]}`;
  // Three highlights: the best and worst checker of each run (a column), and each checker's best run (a row).
  const worse = metric === 'speedup' ? Math.min : Math.max;
  const value = (r: RunSummary, id: string): number => {
    const c = defaultCheckers(r).find(x => x.id === id);
    return c ? compareValue(c, metric) : NaN;
  };
  const column = (r: RunSummary) => ids.map(id => value(r, id)).filter(Number.isFinite);
  const winners = list.map(r => (column(r).length ? better(...column(r)) : NaN));
  // A run with one checker has no slowest: it would be its fastest too.
  const losers = list.map(r => (column(r).length > 1 ? worse(...column(r)) : NaN));
  const row = (id: string): string => {
    const values = list.map(r => value(r, id));
    const present = values.filter(Number.isFinite);
    // A row where every run reads the same, such as the reference at 1.0×, has no best.
    const best = present.length > 1 && new Set(present).size > 1 ? better(...present) : NaN;
    return `<tr><td><span class="swatch" style="background:${familyColor(familyOf(id))}"></span><span title="${esc(id)}">${nameHtml(id)}</span></td>${values
      .map((v, i) => {
        if (!Number.isFinite(v)) return '<td class="num"><span class="muted">n/a</span></td>';
        const classes = ['num', v === best ? 'best' : '', v === winners[i] ? 'winner' : '', v === losers[i] ? 'loser' : ''].filter(Boolean).join(' ');
        return `<td class="${classes}"><span class="cell">${compareFormat(v, metric)}</span></td>`;
      })
      .join('')}</tr>`;
  };
  const top = metric === 'memory' ? 'Lightest' : 'Fastest';
  const bottom = metric === 'memory' ? 'Heaviest' : 'Slowest';

  // Sorting: a run column orders best first (worst first when reversed), runs
  // without that checker last either way; ties keep family order.
  const sort = state.compareSort && (state.compareSort.by === 'checker' || state.compareSort.by < list.length) ? state.compareSort : null;
  const sign = metric === 'speedup' ? -1 : 1;
  const rows = [...ids];
  if (sort?.by === 'checker') {
    rows.sort((a, b) => short(a).localeCompare(short(b), 'en', { numeric: true }) * (sort.reverse ? -1 : 1));
  } else if (sort) {
    const r = list[sort.by]!;
    rows.sort((a, b) => {
      const [va, vb] = [value(r, a), value(r, b)];
      if (!Number.isFinite(va) || !Number.isFinite(vb)) return Number.isFinite(va) ? -1 : Number.isFinite(vb) ? 1 : 0;
      return (va - vb) * sign * (sort.reverse ? -1 : 1);
    });
  }
  // aria-sort names the visible order: speedups best first are descending, seconds and MiB ascending.
  const ariaSort = (by: 'checker' | number): string => {
    if (!sort || sort.by !== by) return 'none';
    const ascending = by === 'checker' ? !sort.reverse : (sign === 1) !== sort.reverse;
    return ascending ? 'ascending' : 'descending';
  };
  const arrow = (by: 'checker' | number): string => {
    const dir = ariaSort(by);
    const path = dir === 'ascending' ? 'M8 12.5v-9M4.5 7 8 3.5 11.5 7' : dir === 'descending' ? 'M8 3.5v9M4.5 9 8 12.5 11.5 9' : 'M5 6.5 8 3.5l3 3M5 9.5l3 3 3-3';
    return `<svg class="sort-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  };
  return `<section class="card compare-panel">
    <div class="card-head">
      <div><h2>Compare ${list.length} runs</h2><p class="hint">${esc(when)}. Checkers as shipped. Speedups are against each run's own reference, so compare ratios across machines and seconds within one.</p></div>
      <div class="compare-actions">${segmented('compare-metric', COMPARE_METRICS, metric)}</div>
    </div>
    ${(() => {
      const refs = [...new Set(list.map(r => r.reference))];
      return refs.length > 1
        ? `<p class="compare-note">These runs use different references (${refs.map(r => esc(short(r))).join(', ')}), so their speedups are not directly comparable; compare wall time within a machine instead.</p>`
        : '';
    })()}
    <div class="compare-runs">${list
      .map((r, i) => `<span class="compare-run"><span class="swatch" style="background:${runColor(i)}"></span>${esc(names[i]!)}<span class="muted"> · ${esc(where(r))} · ${esc(r.machine.cpu)}</span></span>`)
      .join('')}</div>
    <div class="chart" id="chart-compare" style="height:340px"></div>
    <div class="table-scroll" data-scroll="compare"><table class="data compare-table">
      <thead><tr><th aria-sort="${ariaSort('checker')}"><button type="button" class="sort" data-sort="checker">Checker${arrow('checker')}</button></th>${list
        // The CPU name is cut to fit the column; hovering or focusing the header shows the whole run.
        .map(
          (r, i) => `<th class="num run-head" aria-sort="${ariaSort(i)}"><button type="button" class="sort" data-sort="${i}" aria-describedby="run-tip-${i}"><span class="head-text"><span class="head-main"><span class="swatch" style="background:${runColor(i)}"></span>${esc(r.machine.platform)}<span class="source ${r.source.kind}">${r.source.kind === 'ci' ? 'CI' : 'Local'}</span></span><span class="sub">${esc(r.machine.cpu)}</span></span>${arrow(i)}</button>
            <span class="run-tip" role="tooltip" id="run-tip-${i}"><b>${esc(r.machine.cpu)}</b><span>${r.machine.cores} cores · ${esc(r.machine.os)}</span><span>${esc(where(r))} · ${esc(day(r.date))}</span></span></th>`
        )
        .join('')}</tr></thead>
      <tbody>${rows.map(row).join('')}</tbody></table></div>
    <p class="compare-legend"><span class="cell winner-key">${top}</span> in its run <span class="cell loser-key">${bottom}</span> in its run <span class="best-key">Bold</span> this checker's best run</p>
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
  // Re-rendering replaces every element, so a table scrolled sideways (sorting the
  // compare table on a phone) would jump back to its start. Each [data-scroll]
  // container gets its offset back below.
  const scrolled = new Map([...app.querySelectorAll<HTMLElement>('[data-scroll]')].map(el => [el.dataset['scroll']!, el.scrollLeft]));
  const brand = `<header class="topbar"><div class="brand"><span class="brand-mark">${icon.logo}</span>ts-check-arena</div>
    <nav class="topbar-links">
      <a class="topbar-link" href="#libs">${icon.libs}Libs</a>
      <a class="topbar-link" href="https://github.com/relliv/ts-check-arena/blob/main/docs/METHOD.md">${icon.method}Method</a>
    </nav></header>`;
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
      <div class="field"><span>Run</span><div class="picker-row">${runPicker(run)}${
        // While runs are compared, leaving that view sits next to the picker that started it.
        compared.length ? `<button type="button" class="exit-compare" id="compare-close" aria-label="Exit compare">${icon.cross}<span>Exit compare</span></button>` : ''
      }</div></div>
      ${settings.length > 1 ? `<div class="field"><span>Threads</span>${segmented('threads', settings.map(t => [t, t === 'default' ? 'As shipped' : `${t}`]), state.threads)}</div>` : ''}
    </div>
    ${versionNote(run) ?? ''}
    ${compared.length ? compareSection(compared) : ''}
    ${hero(run, checkers)}
    <div class="meta">
      ${projectBadge(run)}
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
      <div class="chart" id="chart-bars" style="height:${Math.max(240, checkers.length * (isNarrow() ? 30 : 40) + 48)}px"></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h2>Speed and memory</h2><p class="hint">Down and to the left is better.</p>
        <div class="chart fill" id="chart-scatter"></div>
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
        ? `<section class="card"><h2>Across platforms</h2><p class="hint">Newest run per platform; each bar is the speedup against that run's own reference. Compare ratios, not seconds.</p><div class="chart" id="chart-platforms" style="height:${platformHeight(platforms)}px"></div></section>`
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

  for (const el of app.querySelectorAll<HTMLElement>('[data-scroll]')) el.scrollLeft = scrolled.get(el.dataset['scroll']!) ?? 0;
  wireRunPicker(app);
  app.querySelector<HTMLElement>('.note-action')?.addEventListener('click', e => {
    selectRun((e.currentTarget as HTMLElement).dataset['run']!);
  });
  app.querySelector('#compare-close')?.addEventListener('click', () => {
    state.compare = null;
    state.compareSort = null;
    render();
  });
  app.querySelector('.compare-table thead')?.addEventListener('click', e => {
    const raw = (e.target as HTMLElement).closest<HTMLElement>('button.sort')?.dataset['sort'];
    if (raw === undefined) return;
    const by = raw === 'checker' ? 'checker' : Number(raw);
    const now = state.compareSort;
    state.compareSort = now?.by !== by ? { by, reverse: false } : now.reverse ? null : { by, reverse: true };
    render();
    // The re-render replaces the header; a keyboard user (no click count) keeps their place on it.
    if ((e as MouseEvent).detail === 0) app.querySelector<HTMLElement>(`.compare-table button.sort[data-sort="${raw}"]`)?.focus();
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
mountLibs(runs);
mountVariantPopover();
