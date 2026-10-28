# ts-check-arena

**How fast are the TypeScript type checkers, version by version, on your project, and do they report the same errors?**

tsc, tsgo, tsrs, tsc-rs, tsc-ts and `bun check`, each pinned to exact versions, timed side by side on any project on disk or on a pinned public corpus, on macOS, Linux and Windows. Every number comes with the raw records behind it. How a run works, and what it does not show: [docs/METHOD.md](docs/METHOD.md).

## Quick start

```sh
pnpm install                       # the arena and every checker version in tools/
pnpm arena tool list               # what is installed, and what has no build here
pnpm arena corpus setup vite       # the default benchmark project, pinned and built
pnpm arena run --corpus vite       # benchmark it on this machine
pnpm arena run --target ../my-app  # benchmark a project on this machine
pnpm arena run --target ../my-app --no-save  # same, but print the report and keep no records
pnpm dev                           # the site, with published runs and the data branch
```

A run against a path is written to `results/private/` (gitignored) and stays on this machine. With `--no-save` nothing is kept at all: the report is printed to the terminal and every record is deleted, which suits private projects. To share one, `pnpm arena publish <run-id> --label <neutral name>` copies it into `results/`, scrubbed of paths and user names, for you to review and commit. Add `--anonymize-configs` for a private project: config paths become `config-001` and so on, and shadow config values are hidden.

## Checker versions

Each family ([checkers.json](checkers.json)) is a set of exact versions, one workspace package each, all pinned by one lockfile:

```sh
pnpm arena tool add tsgo@7.1.0-beta tsrs@0.18.0-ts7.1.0-dev.20260929 bun@1.4.3
pnpm arena tool remove tsc-ts@0.0.4
pnpm arena watch                   # versions on npm older than 7 days that the store lacks
pnpm arena families                # families, platforms and variants
```

A documented opt-in mode runs as a variant next to the default: `tsrs@0.20.1-ts7.1.0-beta+fast` adds `--fast`. Runs include every installed tool's variants unless `--checkers` lists entries.

| Family | Package | Platforms |
|---|---|---|
| tsc | `typescript` < 7 | everywhere Node runs |
| tsgo | `typescript` >= 7 | macOS, Linux, Windows (x64, arm64) |
| tsrs | `tsrs` | macOS arm64, Linux x64 and arm64; macOS x64 and Windows x64 from 0.20.1 |
| tsc-rs | `tsc-rs` | macOS, Linux, Windows (x64, arm64) |
| tsc-ts | `tsc-ts` | macOS, Linux (x64, arm64), Windows x64 |
| bun | `bun` >= 1.4.3 | macOS, Linux, Windows (x64, arm64) |

The supply chain policy in [pnpm-workspace.yaml](pnpm-workspace.yaml) applies: a version must be 7 days old (`--allow-young` adds a reviewed exception for nightlies), and a weaker publish trust than an earlier version is refused (`--allow-trust-downgrade`, with the evidence in a comment).

## Running

```sh
pnpm arena run --target <path> \
  --checkers tsc@6.0.3,tsgo@7.0.2,tsgo@7.1.0-beta,bun@1.4.3 \
  --reference tsgo@7.1.0-beta \
  --threads default,1,max \
  --rounds 7
```

- **Configs:** Nx workspaces are discovered from the project graph (every project with a `typecheck` target); otherwise the root `tsconfig.json`, or `--configs a/tsconfig.json,b/tsconfig.json`.
- **TypeScript 7 incompatible configs** (`baseUrl`, `moduleResolution: node`, ...) are checked through a shadow config written inside the target in a self-ignoring `.ts-check-arena/` folder, removed afterwards. Nothing in the project is edited.
- **The reference** defaults to the newest installed tsgo, prereleases included.
- **The gate:** a config is timed only if the reference reports no errors on it.
- **Records:** `results/<run>/run.json`, `timing.csv`, `parity.json`, `parity/`, `summary.json`, `report.md`. `pnpm arena report <dir>` regenerates the summary from the raw records.

## Corpus and CI

[corpus.json](corpus.json) pins public projects to a commit. **vite** is the default: a popular tooling monorepo checked as 11 configs, small enough for every CI runner. type-fest adds pure type-level work. `pnpm arena corpus setup` clones them into your cache folder, outside this repository, and `pnpm arena run --corpus type-fest` benchmarks one.

| Workflow | When | What |
|---|---|---|
| [check](.github/workflows/check.yml) | every push and PR | types, tests, site build, smoke run on macOS, Linux and Windows |
| [bench](.github/workflows/bench.yml) | by hand (Actions, bench, Run workflow), with projects, rounds and threads as inputs | the corpus on six runners; results committed to the `data` branch |
| [site](.github/workflows/site.yml) | after bench, on site changes | builds the site with the `data` branch results and deploys GitHub Pages |
| [watch](.github/workflows/watch.yml) | daily | opens a PR adding checker versions past the release age window |

CI runners are shared machines: their results are ratios within a run, labeled by runner, and never charted with local runs. Pull requests opened by the watch workflow use the default token, so GitHub does not start their checks; close and reopen the PR, or push to it, to run them.

## Development

```sh
pnpm typecheck && pnpm test && pnpm build
pnpm arena run --target fixtures/small --smoke
```

## Credits

The measurement method, the Windows timer and the type-fest lockfile fixture come from [danfry1/ts-checker-bench](https://github.com/danfry1/ts-checker-bench) (MIT).

## License

MIT
