// The Libs dialog: one card per checker family, from checkers.json, saying who
// maintains it, what it is written in and why the arena tests it. A native <dialog>
// that lives outside #app, so re-renders leave it alone, and opens on #libs so the
// list can be linked to.
import type { Family } from '../../src/lib/checkers.ts';
import type { RunSummary } from '../../src/lib/report.ts';
import checkers from '../../checkers.json' with { type: 'json' };
import { FAMILIES, familyColor } from './charts.ts';

const HASH = '#libs';

const esc = (s: unknown): string => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const repoName = (url: string): string => url.replace('https://github.com/', '');

const PLATFORMS: Record<string, string> = {
  'darwin-arm64': 'macOS arm64',
  'darwin-x64': 'macOS x64',
  'linux-arm64': 'Linux arm64',
  'linux-x64': 'Linux x64',
  'win32-arm64': 'Windows arm64',
  'win32-x64': 'Windows x64',
};

function platforms(family: Family): string {
  const keys = Object.keys(family.binary);
  return keys.includes('*') ? 'Everywhere Node runs' : keys.map(k => PLATFORMS[k] ?? k).join(', ');
}

/**
 * Versions of a family that appear in any published run, oldest first. Variants fold
 * into their version. `full` is the npm version, `label` drops the TypeScript port tag.
 */
function tested(family: string, runs: RunSummary[]): { full: string; label: string }[] {
  const versions = new Set<string>();
  for (const run of runs) {
    for (const setting of run.settings) {
      for (const c of setting.checkers) {
        if (c.family !== family) continue;
        versions.add(c.id.slice(c.id.lastIndexOf('@') + 1).replace(/\+.*$/, ''));
      }
    }
  }
  return [...versions]
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map(full => ({ full, label: full.replace(/-ts\d.*$/, '') }));
}

const external = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h-3v9h9v-3M9.5 2.5h4v4M13.5 2.5l-6 6"/></svg>`;
const cross = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`;

function card(family: Family, runs: RunSummary[]): string {
  const versions = tested(family.name, runs);
  return `<article class="lib">
    <header class="lib-head">
      <h3><span class="swatch" style="background:${familyColor(family.name)}"></span>${esc(family.name)}</h3>
      <span class="lib-by">${esc(family.about.maintainer)}</span>
    </header>
    <p class="lib-summary">${esc(family.description)}</p>
    <p class="lib-why">${esc(family.about.why)}</p>
    <dl class="lib-facts">
      <dt>Written in</dt><dd>${esc(family.about.language)}</dd>
      <dt>npm</dt><dd><code>${esc(family.package)}</code>${family.versions === '*' ? '' : ` <span class="lib-range">${esc(family.versions)}</span>`}</dd>
      <dt>Tested</dt><dd>${
        versions.length
          ? versions
              .map(v => `<a class="lib-version" href="https://www.npmjs.com/package/${esc(family.package)}/v/${esc(v.full)}" target="_blank" rel="noopener" title="${esc(family.package)}@${esc(v.full)} on npm"><code>${esc(v.label)}</code></a>`)
              .join(' ')
          : 'Not in a published run yet'
      }</dd>
      <dt>Platforms</dt><dd>${esc(platforms(family))}</dd>
    </dl>
    <nav class="lib-links">
      <a href="${esc(family.about.repo)}" target="_blank" rel="noopener">${esc(repoName(family.about.repo))}${external}</a>
      <a href="https://www.npmjs.com/package/${esc(family.package)}" target="_blank" rel="noopener">npm${external}</a>
    </nav>
  </article>`;
}

/** Adds the dialog to the page once and keeps it in step with the #libs hash. */
export function mountLibs(runs: RunSummary[]): void {
  // The JSON import infers a union per entry; checkers.ts reads the same file as Family[].
  const families = (checkers as unknown as { families: Family[] }).families;
  // Microsoft's own compilers first, as TypeScript's maintainers; the ports follow in chart order.
  const LEAD = ['tsc', 'tsgo'];
  const order = (f: Family) => (LEAD.includes(f.name) ? LEAD.indexOf(f.name) - LEAD.length : FAMILIES.indexOf(f.name as (typeof FAMILIES)[number]));
  const dialog = document.createElement('dialog');
  dialog.className = 'libs';
  dialog.setAttribute('aria-labelledby', 'libs-title');
  dialog.innerHTML = `<div class="libs-body">
    <header class="libs-head">
      <div>
        <h2 id="libs-title">The checkers</h2>
        <p class="hint">What each one is, who maintains it, and why it is in the arena.</p>
      </div>
      <button type="button" class="close" aria-label="Close">${cross}</button>
    </header>
    <div class="libs-grid">${[...families].sort((a, b) => order(a) - order(b)).map(f => card(f, runs)).join('')}</div>
  </div>`;
  document.body.append(dialog);

  const sync = () => {
    if (location.hash === HASH && !dialog.open) dialog.showModal();
    if (location.hash !== HASH && dialog.open) dialog.close();
  };
  dialog.querySelector('.close')!.addEventListener('click', () => dialog.close());
  // A click on the backdrop lands on the dialog element itself, outside .libs-body.
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
  // Esc, the close button and the backdrop all end here: drop the hash without a history entry.
  dialog.addEventListener('close', () => {
    if (location.hash === HASH) history.replaceState(null, '', location.pathname + location.search);
  });
  window.addEventListener('hashchange', sync);
  sync();
}
