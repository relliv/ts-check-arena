#!/usr/bin/env node
// pnpm arena <command>. Run `pnpm arena help` for the list.
import { cpSync, existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { type ThreadSetting, availableOn, binaryPath, families, parseTool, variantIds } from './lib/checkers.ts';
import { corpusProject, setupCorpus } from './lib/corpus.ts';
import { CORPUS_DIR, PLATFORM, RESULTS_DIR, ROOT } from './lib/paths.ts';
import { writeIndex, writeReport } from './lib/report.ts';
import { run } from './lib/run.ts';
import { scrubber } from './lib/scrub.ts';
import { addTools, listTools, pnpmInstall, removeTools } from './lib/store.ts';
import { type Discovery, readConfigList } from './lib/targets.ts';
import { newVersions } from './lib/watch.ts';

const HELP = `ts-check-arena: TypeScript type checkers, side by side, across versions.

  pnpm arena tool list                      installed tools and their status here
  pnpm arena tool add <family@version>...   install checker versions
      --allow-young              before the 7-day release age (adds a reviewed exception)
      --allow-trust-downgrade    accept a reviewed trust downgrade (adds an exception)
  pnpm arena tool remove <family@version>...
  pnpm arena families                       checker families and platforms

  pnpm arena run --target <path> [options]  benchmark a project on this machine
      --checkers <ids>     comma-separated family@version[+variant] list
                           (default: every installed tool and its variants, such as tsrs@...+fast)
      --reference <id>     the checker every other is compared with (default: newest installed tsgo)
      --configs <list>     comma-separated configs, relative to the target
      --configs-file <f>   one config per line
      --discover <mode>    auto | nx | root (default: auto)
      --rounds <n>         timed rounds, odd (default: 7)
      --threads <list>     default,1,4,max (default: default)
      --shadow <mode>      auto | never (default: auto)
      --label <name>       how the target is named in results (default: its folder name)
      --smoke              one round, written to results/.smoke/
      --no-save            keep nothing: print the report, then delete every record
      --allow-battery      run on battery power
  pnpm arena run --corpus <name> [options]  benchmark a pinned public project

  pnpm arena watch [--write]                new checker versions past the 7-day window (--write adds them)
  pnpm arena corpus setup [name]            clone and install corpus projects
  pnpm arena report <run-dir>               regenerate summary.json and report.md
  pnpm arena index                          regenerate results/index.json
  pnpm arena publish <private-run-id> --label <public name> [--anonymize-configs]
                                            copy a local run into results/ under a neutral name;
                                            --anonymize-configs renames config paths to config-001...

Path targets are written to results/private/ (gitignored). Nothing leaves this
machine unless you publish it and push.`;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

/** The newest installed tsgo, prereleases included: the default reference. */
function newestTsgo(): string | undefined {
  return listTools()
    .filter(t => t.family.name === 'tsgo' && binaryPath(t))
    .map(t => t.id)
    .at(-1);
}

function parseThreads(list: string): ThreadSetting[] {
  return list.split(',').map(s => {
    if (s === 'default') return 'default';
    if (s === 'max') return cpus().length;
    const n = Number(s);
    if (!Number.isInteger(n) || n < 1) fail(`--threads: "${s}" is not default, max or a positive integer`);
    return n;
  });
}

async function main(): Promise<void> {
  const [cmd, sub, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case undefined:
    case 'help':
    case '--help':
      console.log(HELP);
      return;

    case 'families':
      for (const f of families) {
        console.log(`${f.name.padEnd(8)} ${f.package.padEnd(12)} ${f.versions.padEnd(6)} ${f.description}`);
        console.log(`${''.padEnd(8)} platforms: ${Object.keys(f.binary).join(', ')}`);
        for (const [name, v] of Object.entries(f.variants ?? {})) console.log(`${''.padEnd(8)} variant +${name} (${v.args.join(' ')}${v.versions ? `, ${v.versions}` : ''}): ${v.description}`);
      }
      return;

    case 'tool': {
      const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: { 'allow-young': { type: 'boolean' }, 'allow-trust-downgrade': { type: 'boolean' }, 'no-install': { type: 'boolean' } } });
      if (sub === 'list') {
        for (const t of listTools()) {
          const status = !availableOn(t) ? `no build for ${PLATFORM}` : binaryPath(t) ? 'installed' : 'not installed (pnpm install)';
          console.log(`${t.id.padEnd(36)} ${status}`);
        }
        return;
      }
      if (positionals.length === 0) fail(`tool ${sub ?? ''}: give at least one family@version`);
      if (sub === 'add') {
        addTools(positionals, { allowYoung: values['allow-young'], allowTrustDowngrade: values['allow-trust-downgrade'], install: !values['no-install'] });
        return;
      }
      if (sub === 'remove') {
        removeTools(positionals, { install: !values['no-install'] });
        return;
      }
      fail(`unknown tool command "${sub}"`);
    }

    case 'run': {
      const { values } = parseArgs({
        args: [sub, ...rest].filter((a): a is string => a !== undefined),
        options: {
          target: { type: 'string' },
          corpus: { type: 'string' },
          checkers: { type: 'string' },
          reference: { type: 'string' },
          configs: { type: 'string' },
          'configs-file': { type: 'string' },
          discover: { type: 'string' },
          rounds: { type: 'string' },
          threads: { type: 'string' },
          shadow: { type: 'string' },
          label: { type: 'string' },
          smoke: { type: 'boolean' },
          'no-save': { type: 'boolean' },
          'allow-battery': { type: 'boolean' },
        },
      });
      let target: string;
      let configs = values.configs?.split(',').filter(Boolean) ?? [];
      let label = values.label;
      if (values.corpus) {
        const project = corpusProject(values.corpus);
        target = join(CORPUS_DIR, project.name);
        if (!existsSync(target)) fail(`corpus project ${project.name} is not set up; run pnpm arena corpus setup ${project.name}`);
        if (configs.length === 0) configs = project.configs;
        label ??= project.name;
      } else if (values.target) {
        target = isAbsolute(values.target) ? values.target : resolve(process.cwd(), values.target);
        if (!existsSync(target)) fail(`target not found: ${values.target}`);
      } else {
        fail('run: pass --target <path> or --corpus <name>');
      }
      if (values['configs-file']) configs = readConfigList(values['configs-file']);
      // By default every installed tool, each followed by its documented variants.
      const checkers = values.checkers?.split(',').filter(Boolean) ?? listTools().filter(t => binaryPath(t)).flatMap(t => [t.id, ...variantIds(t)]);
      const reference = values.reference ?? newestTsgo();
      if (!reference) fail('no reference: install a tsgo version (pnpm arena tool add tsgo@7.0.2) or pass --reference');
      checkers.forEach(parseTool);
      await run({
        target,
        label,
        corpus: Boolean(values.corpus),
        checkers,
        reference,
        configs,
        discovery: (values.discover as Discovery | undefined) ?? 'auto',
        rounds: values.rounds ? Number(values.rounds) : undefined,
        threads: values.threads ? parseThreads(values.threads) : undefined,
        shadow: values.shadow === 'never' ? 'never' : 'auto',
        smoke: values.smoke,
        save: !values['no-save'],
        allowBattery: values['allow-battery'],
      });
      if (!values['no-save']) writeIndex();
      return;
    }

    case 'corpus':
      if (sub !== 'setup') fail('corpus: the only command is setup');
      setupCorpus(rest[0]);
      return;

    case 'report': {
      if (!sub) fail('report: give a run directory');
      const summary = writeReport(resolve(process.cwd(), sub));
      console.log(`${summary.id}: summary.json and report.md written`);
      return;
    }

    case 'index':
      console.log(`${writeIndex().length} runs in results/index.json`);
      return;

    case 'publish': {
      const { values } = parseArgs({ args: rest, options: { label: { type: 'string' }, 'anonymize-configs': { type: 'boolean' } } });
      if (!sub || !values.label) fail('publish: pnpm arena publish <private-run-id> --label <public name>');
      const from = join(RESULTS_DIR, 'private', sub);
      if (!existsSync(join(from, 'run.json'))) fail(`no private run ${sub}`);
      const meta = JSON.parse(readFileSync(join(from, 'run.json'), 'utf8')) as {
        label: string;
        id: string;
        configs: { checked: { config: string }[]; rejected: { config: string }[] };
      };
      // config-001 and so on, longest path first so no path is replaced inside another.
      const configNames = values['anonymize-configs']
        ? [...meta.configs.checked, ...meta.configs.rejected]
            .map(c => c.config)
            .sort()
            .map((config, i) => [config, `config-${String(i + 1).padStart(3, '0')}`] as const)
            .sort((a, b) => b[0].length - a[0].length)
        : [];
      const configSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      // The id ends in the label's slug, and a -N suffix for a second run that day.
      const privateTail = new RegExp(`${slug(meta.label)}(-\\d+)?$`);
      if (!privateTail.test(meta.id)) fail(`run id ${meta.id} does not end in its label ${meta.label}`);
      const publicId = meta.id.replace(privateTail, slug(values.label));
      const to = join(RESULTS_DIR, publicId);
      if (existsSync(to)) fail(`results/${publicId} exists`);
      cpSync(from, to, { recursive: true });
      if (values['anonymize-configs']) hideShadowValues(join(to, 'run.json'));
      // Replace the private label everywhere, including config paths in raw output.
      const relabel = scrubber({});
      for (const file of listFiles(to)) {
        let text = readFileSync(file, 'utf8').replaceAll(meta.id, publicId).replaceAll(meta.label, values.label);
        for (const [config, name] of configNames) text = text.replaceAll(config, name);
        writeFileSync(file, relabel(text));
      }
      // parity/<checker>/<config slug>.txt files are named after configs too.
      for (const [config, name] of configNames) {
        for (const file of listFiles(to).filter(f => f.endsWith(`/${configSlug(config)}.txt`))) {
          renameSync(file, join(dirname(file), `${name}.txt`));
        }
      }
      writeReport(to);
      writeIndex();
      console.log(
        `published to ${relative(ROOT, to)}; review it before you commit${values['anonymize-configs'] ? '' : ': config paths name the project folders (--anonymize-configs hides them)'}`
      );
      return;
    }

    case 'install':
      pnpmInstall();
      return;

    case 'watch': {
      const found = newVersions();
      console.log(found.length ? found.join('\n') : 'no new versions past the release age window');
      if (sub === '--write' && found.length) addTools(found, { install: false });
      return;
    }

    default:
      fail(`unknown command "${cmd}"; run pnpm arena help`);
  }
}

/**
 * Keeps which options a shadow config overrode but not their values: `paths` and
 * `typeRoots` list the project's own folders.
 */
function hideShadowValues(file: string): void {
  const meta = JSON.parse(readFileSync(file, 'utf8')) as {
    shadows?: Record<string, Record<string, unknown>>;
    configs: { checked: { shadow: unknown }[] };
  };
  const names = (o: Record<string, unknown>) => Object.fromEntries(Object.keys(o).map(k => [k, '(hidden)']));
  for (const key of Object.keys(meta.shadows ?? {})) meta.shadows![key] = names(meta.shadows![key]!);
  for (const c of meta.configs.checked) {
    if (c.shadow && typeof c.shadow === 'object') c.shadow = names(c.shadow as Record<string, unknown>);
  }
  writeFileSync(file, `${JSON.stringify(meta, null, 2)}\n`);
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(d => d.isFile())
    .map(d => join(d.parentPath, d.name));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
