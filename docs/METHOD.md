# Method

What a run measures, how, and what it does not show. This document has no numbers, so it stays true from run to run; the numbers are in each run's `report.md`. Everything a run does is in [`src/lib/run.ts`](../src/lib/run.ts), and everything a report computes is in [`src/lib/report.ts`](../src/lib/report.ts) and [`src/lib/stats.ts`](../src/lib/stats.ts).

The measurement method follows [danfry1/ts-checker-bench](https://github.com/danfry1/ts-checker-bench) (MIT), whose [METHOD.md](https://github.com/danfry1/ts-checker-bench/blob/main/docs/METHOD.md) this document is modeled on. The arena adds versions, platforms, any project on disk and projects TypeScript 7 refuses to read.

## Principles

1. **Every number has a record behind it.** A run keeps the timing of every single check, the full output of every checker that disagrees with the reference, the exact version and binary checksum of every checker, and the machine and conditions it ran under. A number that cannot be traced back to those records is not published.
2. **A checker is a version, not a name.** "tsrs" is not a result; `tsrs@0.18.0-ts7.1.0-dev.20260929` is. Every checker is pinned to an exact version in one lockfile, so a run on another machine or a CI runner checks with byte-identical binaries, and versions of one family can be compared side by side.
3. **Fast and wrong is not fast.** A checker's time counts only where its output is recorded and compared. A checker that fails on a config, exits non-zero without a diagnostic, is not timed at all.
4. **Shipped defaults first, matched settings second.** Every checker runs as it ships. Thread settings are matched only through each checker's own documented flags, and the report says where those flags are documented.
5. **The project is never edited.** Configs TypeScript 7 refuses are checked through a shadow config that extends them; source files and tsconfigs stay as they are.
6. **Nothing identifying leaves the machine.** Absolute paths, the home directory and the user name are scrubbed from every record. A run against a local path stays in `results/private/` until someone publishes it under a neutral name.
7. **Noise is recorded, not hidden.** Load, busy processes, speed limits and the run's source (a quiet local machine or a shared CI runner) are part of the record. Results from different sources are never mixed on one axis.

## Checkers and versions

A family ([`checkers.json`](../checkers.json)) describes what stays the same across versions: the npm package, the platform packages that hold the native executable, how a config is passed, plain one-line output, thread flags and how many threads it uses with none. Version-specific arguments are scoped to a version range: `bun check` gained `--no-script` in 1.4.4, so only 1.4.4 and later get it.

| Family | Package | What it is |
|---|---|---|
| tsc | `typescript` below 7 | The JavaScript compiler, run with the current Node; the only checker with Node start-up in its time |
| tsgo | `typescript` 7 and later | Microsoft's native TypeScript 7 compiler (Go) |
| tsrs | `tsrs` | A Rust port of the TypeScript 7 checker (oxc-project) |
| tsc-rs | `tsc-rs` | A Rust port of the TypeScript 7 compiler (pingdotgg/ts-rust) |
| tsc-ts | `tsc-ts` | A TypeScript port of tsgo compiled to a native executable (Vercel Labs) |
| bun | `bun` 1.4.3 and later | Bun's built-in `bun check` |

Each version is a workspace package, `tools/<family>@<version>/`, added with `pnpm arena tool add`. The repository's supply chain policy applies to them like any dependency: a version must be 7 days old, and a version whose publish trust is weaker than an earlier one is refused. Exceptions are exact versions in `pnpm-workspace.yaml`, with their evidence in a comment.

Each checker's native executable is run directly, not through its npm launcher, so Node's start-up is not part of its time. The executable's path is resolved from the platform package next to the checker's package, and its sha256 is recorded. A family that publishes no build for a platform is recorded as not available there.

## A run

`pnpm arena run` writes `results/<date>-<cpu>-<os>-<label>/` (local paths: `results/private/...`).

1. **Preflight.** It refuses to start without a timer, on battery, under Rosetta, with a checker missing, or for a corpus project with a `node_modules` folder above it. It records warnings about load, busy processes, a CPU speed limit and `node_modules` folders above the target, since TypeScript loads `@types` packages from every folder above a config.
2. **Configs.** From a list, from the Nx project graph (each project with a `typecheck` target: its `tsconfig.lib.json`, else `tsconfig.app.json`, else `tsconfig.json`), or the target's `tsconfig.json`.
3. **Shadows.** Each config is read with the TypeScript 6 API. Where it sets an option TypeScript 7 removed, a shadow config that extends it unsets only that option (see [Shadow configs](#shadow-configs)). Every checker, TypeScript 6 included, checks the same file, so all of them check the same program.
4. **Gate.** The reference checker runs each config. A config where it reports any error is rejected and recorded with the count; one where it exits non-zero without a diagnostic (crashed, killed, unreadable) is recorded as not measured.
5. **Diagnostics.** Every checker runs each accepted config once with plain output, and its output is compared with the reference's (see [Diagnostics](#diagnostics)). A checker that failed on any config is excluded from timing.
6. **Timing.** For each thread setting: one warm-up round, then the given number of rounds (odd, 7 by default). A round checks every config with every checker. Each round starts one checker further along than the round before, so every checker runs in every position. The exit code of every timed check must match the exit code recorded in step 5.
7. **Records.** `run.json`, `timing.csv` (one row per check, warm-ups marked), `parity.json`, `parity/<checker>/<config>.txt` for every output that differs, `summary.json` and `report.md`.

The machine is kept awake with `caffeinate -dis` on macOS and `SetThreadExecutionState` on Windows, and power is checked before every round.

## Measurement

| OS | CPU time and peak memory | Wall time |
|---|---|---|
| macOS | `/usr/bin/time -l`: rusage of the process and its children; maximum resident set size | a nanosecond clock around the timer's process |
| Linux | GNU `/usr/bin/time -f`: the same fields | a nanosecond clock around the timer's process |
| Windows | [`windows-time.ps1`](../src/lib/windows-time.ps1): `GetProcessTimes` and the peak working set of the process alone | a stopwatch around the process |

`/usr/bin/time` prints wall time in hundredths of a second, too coarse for configs that check in milliseconds, so wall time comes from a nanosecond clock around the timer's own process. The timer's start-up is the same for every checker.

- **A pass** checks every accepted config once, one after another. Its wall and CPU times are the sums over the configs, and its peak memory is the largest single config's peak.
- **Wall time** is reported as the median pass of the timed rounds, with the min and max pass. Medians are only taken of odd-length sets.
- **"vs reference"** is the reference's median divided by the checker's: above 1 is faster.
- **CPU** is user plus sys time summed over all threads, as a median. **Peak** is the median of the passes' peak memory, in MiB.

Peak memory is comparable between checkers on one machine, not exactly between operating systems: Windows reports the process alone, macOS and Linux include children.

## Threads

`--threads default,1,4,max` times each setting. `default` runs every checker as it ships. A number uses each checker's documented flag:

| Family | Default, as documented | Flags | Source |
|---|---|---|---|
| tsc | single threaded | none | TypeScript 6 has no thread option |
| tsgo | 4 checkers | `--singleThreaded`, `--checkers N` | `tsc --help --all`; the tsc-ts and tsc-rs READMEs state the default |
| tsrs | one per core, capped | `--singleThreaded`, `--checkers N` | oxc-project/tsrs `docs/COMPATIBILITY.md` |
| tsc-rs | 4 checkers | `--singleThreaded`, `--checkers N` | pingdotgg/ts-rust README |
| tsc-ts | one per core, up to 16, at least 4 | `--singleThreaded`, `--checkers N` | tsc-ts README |
| bun | one per core | `--threads=N` | `bun check --help` |

A family without a thread flag runs only in the `default` setting. `--checkers N` sets the number of type checkers while bun's `--threads=N` sets threads: the closest documented equivalents, not the same setting. A thread flag limits the checker's own work, not its runtime; Go's garbage collector, for one, runs on other cores.

## Shadow configs

TypeScript 7 removed options many projects still set. A project using them is not excluded: it is checked through a shadow config, `{ "extends": "<the config>", "compilerOptions": { ...overrides } }`, with these overrides only:

| TypeScript 7 refuses | Override |
|---|---|
| `baseUrl` | unset; `paths` targets made absolute, since TypeScript 7 accepts only relative or absolute targets without it |
| `moduleResolution` `node`, `node10`, `classic` | `bundler`, with `module` `esnext` where bundler does not accept the module setting |
| `esModuleInterop: false`, `allowSyntheticDefaultImports: false` | unset |
| explicit `types` under inherited `typeRoots` | the `node_modules` folders from the config up to the target added as roots, since TypeScript 7 resolves `types` only inside `typeRoots`; not done for the `*` wildcard |

Shadows are written inside the target, in `.ts-check-arena/`, which ignores itself through its own `.gitignore` and is removed after the run. They cannot live elsewhere: TypeScript resolves `types` entries from the config's directory upward, so from a folder outside the project no `node_modules` would be in reach. Each run records the overrides of every shadowed config in `run.json`, and the report says how many configs were shadowed.

A shadow can change what TypeScript 6 checks where an override changes module resolution. The gate still applies: a config that does not check cleanly under the reference is rejected, not timed, and the diagnostics table shows any checker, TypeScript 6 included, that disagrees.

## Diagnostics

Each checker's output is compared with the reference's in two ways:

- **Byte for byte**, after bun's printed elapsed time is masked.
- **Normalized.** Each diagnostic becomes one `path:line:col TSnnnn message` line, sorted; elaboration lines and summaries are dropped; Windows separators become `/`. "Same after normalizing" means the same errors at the same places with the same top-level messages.

**Extra** counts diagnostics only the checker reported, **missing** those only the reference reported. **Failed** means the checker exited non-zero without any diagnostic. The full output of every differing or failing config is kept in `parity/`.

The gate makes the reference clean on every timed config, so on most projects this compares clean output. A difference there is a real disagreement: a checker reporting errors the reference does not.

## Sources: local and CI

A run records where it ran: `local`, or `ci` with the runner label, image and workflow run link. They answer different questions.

- **Local runs** on a quiet machine are the precise numbers, in seconds.
- **CI runs** are breadth and history: six runners (Linux x64 and arm64, macOS arm64 and x64, Windows x64 and arm64) on a schedule and for every new checker version. Hosted runners are shared virtual machines whose CPU model can change between runs, so CI results are read as ratios against the reference within one run, never as seconds across runs. Each CI run records its CPU model, and only runs with matching models are compared.

The site never puts local and CI runs on one axis.

## Projects

Any project on disk can be a target (`--target <path>`). For results that are comparable over time and across machines, [`corpus.json`](../corpus.json) pins public projects to a commit and installs them with a lockfile. Corpus checkouts live outside the repository, in the user's cache folder, because TypeScript would otherwise load the arena's own `@types` packages.

## Caveats

- **One machine per run.** Results from other hardware or operating systems may differ.
- **Background activity** is recorded, not controlled.
- **Between-session variation.** Medians can move by several percent between runs on one machine; compare ratios, and compare runs before reading meaning into small differences.
- **Versions port different TypeScript builds.** tsrs and tsc-rs port TypeScript 7.1 development builds and say which in `--version`; differences against a 7.0 reference can come from TypeScript itself, not the port.
- **Early tools.** Several checkers are pre-1.0 and describe themselves as experimental.
- **Scope.** Full `--noEmit` checks only. Emit, `--incremental`, `--build`, `--watch` and editor use are not measured.
- **Shadowed configs** check the program TypeScript 7 would check after the listed overrides; a project's real TypeScript 7 migration may choose other settings.
- **Platform coverage differs.** A family without a build for a platform is recorded as not available there.

## What this does not show

Why one checker is faster than another. A report shows the time and memory each used and how that changes with threads and versions. The cause is not measured: work skipped, data structures, memory management, or parallelism.
