# vite

> **`tsrs@0.16.0`** is **3.4×** faster than `tsgo@7.1.0-beta`: 3.13 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | ARM Neoverse-N2, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1017-azure), Node v26.13.0, CI runner `ubuntu-24.04-arm` |
| **When** | 2026-10-31 14:33 UTC, 13 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-31-unknown-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **3.13 s** | 3.13 to 3.26 | 3.4× | 5.13 s | 322 MiB |
| `tsrs@0.18.0` | **3.23 s** | 3.17 to 3.25 | 3.3× | 5.13 s | 321 MiB |
| `tsrs@0.20.1+fast` | **3.24 s** | 3.17 to 3.38 | 3.2× | 5.19 s | 303 MiB |
| `tsrs@0.20.1` | **3.55 s** | 3.49 to 3.56 | 3.0× | 5.15 s | 317 MiB |
| `bun@1.4.3` | **4.34 s** | 4.29 to 4.35 | 2.4× | 8.67 s | 212 MiB |
| `tsc-rs@0.6.0` | **4.49 s** | 4.48 to 4.52 | 2.3× | 7.12 s | 640 MiB |
| `tsc-rs@0.7.0` | **4.51 s** | 4.37 to 4.85 | 2.3× | 7.01 s | 640 MiB |
| `tsc-ts@0.0.5` | **8.64 s** | 8.44 to 8.96 | 1.2× | 15.24 s | 697 MiB |
| `tsc-ts@0.0.4` | **8.65 s** | 8.57 to 8.94 | 1.2× | 15.08 s | 705 MiB |
| `tsgo@7.1.0-beta` | **10.52 s** | 10.36 to 11.14 | 1.0× | 19.57 s | 683 MiB |
| `tsgo@7.0.2` | **15.01 s** | 14.16 to 15.35 | 0.7× | 27.43 s | 935 MiB |
| `tsc@6.0.3` | **45.96 s** | 45.11 to 48.66 | 0.2× | 77.19 s | 976 MiB |

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | a13ba35a75869bc2 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 029ece746ac9f970 |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | e0d9594f128b9a63 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 28955d010d30dc96 |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 3ca243b8cb17159c |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | 9f9f7f370529577a |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | f86e8070c267b12d |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 869ebb2d3a70f8d7 |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 0999c116eb963bd7 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | c35b772b949a6f2c |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | c35b772b949a6f2c |

## Conditions

- busy process: node-MainThread at 62.6% CPU
- busy process: node-MainThread at 129% CPU
