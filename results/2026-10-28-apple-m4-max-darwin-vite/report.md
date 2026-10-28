# vite

> **`tsrs@0.16.0`** is **3.3×** faster than `tsgo@7.1.0-beta`: 1.18 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M4 Max, 16 cores, 48 GiB |
| **System** | macOS 27.0.1 (26A434), Node v26.0.0, local machine |
| **When** | 2026-10-28 10:17 UTC, 6 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-apple-m4-max-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **1.18 s** | 1.17 to 1.19 | 3.3× | 3.75 s | 377 MiB |
| `tsrs@0.18.0` | **1.18 s** | 1.17 to 1.19 | 3.3× | 3.71 s | 377 MiB |
| `tsrs@0.20.1+fast` | **1.20 s** | 1.19 to 1.22 | 3.2× | 3.79 s | 350 MiB |
| `tsrs@0.20.1` | **1.46 s** | 1.45 to 1.47 | 2.7× | 3.35 s | 319 MiB |
| `bun@1.4.3` | **1.50 s** | 1.49 to 1.51 | 2.6× | 4.72 s | 366 MiB |
| `tsc-rs@0.7.0` | **1.84 s** | 1.83 to 1.84 | 2.1× | 3.31 s | 610 MiB |
| `tsc-rs@0.6.0` | **1.85 s** | 1.85 to 1.85 | 2.1× | 3.39 s | 610 MiB |
| `tsc-ts@0.0.4` | **3.34 s** | 3.33 to 3.37 | 1.2× | 8.15 s | 782 MiB |
| `tsc-ts@0.0.5` | **3.36 s** | 3.34 to 3.38 | 1.2× | 8.14 s | 770 MiB |
| `tsgo@7.1.0-beta` | **3.90 s** | 3.89 to 3.90 | 1.0× | 9.80 s | 688 MiB |
| `tsgo@7.0.2` | **5.25 s** | 5.21 to 5.28 | 0.7× | 12.59 s | 952 MiB |
| `tsc@6.0.3` | **15.42 s** | 15.30 to 15.47 | 0.3× | 30.67 s | 1024 MiB |

## Diagnostics

Each checker's output on every config, compared with `tsgo@7.1.0-beta`.

| Checker | Result | Identical | Same after normalizing | Differs | Failed | Extra | Missing |
|---|---|--:|--:|--:|--:|--:|--:|
| `tsgo@7.1.0-beta` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `bun@1.4.3` | ✅ same errors | 0 | 11 | 0 | 0 | 0 | 0 |
| `tsc@6.0.3` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.6.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.7.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-ts@0.0.4` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-ts@0.0.5` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsgo@7.0.2` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.16.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.18.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.20.1` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.20.1+fast` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |

Extra: diagnostics only that checker reported. Missing: diagnostics only the reference reported. The full output of every differing config is in parity/.

## Checkers

| Checker | Package | Default threads | Version output | Binary sha256 |
|---|---|---|---|---|
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 29f5eb8daa5c8cf6 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 28c7dd0a06916aba |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | 83024f4dec342995 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 23dd7b5cf77478cd |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | fe7255e19cf2872d |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | dc23e6e23c7a418f |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | a82f731365ad69d5 |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | c04e14af7538fd95 |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | b3f1c65d555aa0db |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |

## Conditions

- load average 74.23 on 16 cores
- busy process: mds_stores at 88.1% CPU
- busy process: corespotlightd at 42.5% CPU
- busy process: mediaanalysisd at 145.9% CPU
- node_modules above the target in ~
