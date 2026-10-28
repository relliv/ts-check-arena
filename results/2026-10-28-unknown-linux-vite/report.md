# vite

> **`tsrs@0.16.0`** is **3.4×** faster than `tsgo@7.1.0-beta`: 3.26 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | ARM Neoverse-N2, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1017-azure), Node v24.22.1, CI runner `ubuntu-24.04-arm` |
| **When** | 2026-10-28 10:56 UTC, 18 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-unknown-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **3.26 s** | 3.22 to 3.38 | 3.4× | 5.25 s | 332 MiB |
| `tsrs@0.20.1+fast` | **3.34 s** | 3.20 to 3.43 | 3.3× | 5.30 s | 310 MiB |
| `tsrs@0.18.0` | **3.37 s** | 3.29 to 3.41 | 3.3× | 5.34 s | 328 MiB |
| `tsrs@0.20.1` | **3.69 s** | 3.60 to 3.76 | 3.0× | 5.38 s | 324 MiB |
| `tsc-rs@0.7.0` | **4.55 s** | 4.49 to 4.82 | 2.4× | 7.19 s | 647 MiB |
| `bun@1.4.3` | **4.60 s** | 4.49 to 4.78 | 2.4× | 9.11 s | 216 MiB |
| `tsc-rs@0.6.0` | **4.68 s** | 4.58 to 4.92 | 2.4× | 7.36 s | 646 MiB |
| `tsc-ts@0.0.5` | **8.60 s** | 8.52 to 8.85 | 1.3× | 15.08 s | 694 MiB |
| `tsc-ts@0.0.4` | **8.78 s** | 8.59 to 9.06 | 1.3× | 15.40 s | 703 MiB |
| `tsgo@7.1.0-beta` | **11.05 s** | 10.89 to 11.38 | 1.0× | 20.18 s | 692 MiB |
| `tsgo@7.0.2` | **15.97 s** | 15.55 to 16.42 | 0.7× | 28.12 s | 938 MiB |
| `tsc@6.0.3` | **48.73 s** | 48.07 to 50.29 | 0.2× | 82.21 s | 1070 MiB |

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

- load average 2.34 on 4 cores
- busy process: MainThread at 55.9% CPU
- busy process: MainThread at 100% CPU
