# vite

> **`tsrs@0.18.0`** is **3.3×** faster than `tsgo@7.1.0-beta`: 3.25 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | ARM Neoverse-N2, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1017-azure), Node v26.13.1, CI runner `ubuntu-24.04-arm` |
| **When** | 2026-11-25 09:53 UTC, 15 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-unknown-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.18.0` | **3.25 s** | 3.20 to 3.33 | 3.3× | 5.25 s | 328 MiB |
| `tsrs@0.16.0` | **3.25 s** | 3.19 to 3.33 | 3.3× | 5.20 s | 332 MiB |
| `tsrs@0.20.1+fast` | **3.27 s** | 3.21 to 3.35 | 3.3× | 5.24 s | 310 MiB |
| `tsrs@0.20.1` | **3.61 s** | 3.58 to 3.65 | 2.9× | 5.22 s | 324 MiB |
| `bun@1.4.3` | **4.36 s** | 4.36 to 4.42 | 2.4× | 8.69 s | 216 MiB |
| `tsc-rs@0.8.0` | **4.56 s** | 4.52 to 4.88 | 2.3× | 7.17 s | 648 MiB |
| `tsc-rs@0.6.0` | **4.60 s** | 4.54 to 4.64 | 2.3× | 7.18 s | 646 MiB |
| `tsc-rs@0.7.0` | **4.61 s** | 4.50 to 4.78 | 2.3× | 7.20 s | 647 MiB |
| `tsc-ts@0.1.5` | **5.46 s** | 5.38 to 5.65 | 1.9× | 9.52 s | 382 MiB |
| `tsc-ts@0.0.5` | **8.28 s** | 8.14 to 8.54 | 1.3× | 14.48 s | 694 MiB |
| `tsc-ts@0.0.4` | **8.44 s** | 8.25 to 8.67 | 1.3× | 14.79 s | 704 MiB |
| `tsgo@7.1.0-beta` | **10.63 s** | 10.55 to 10.71 | 1.0× | 19.39 s | 676 MiB |
| `tsgo@7.0.2` | **14.75 s** | 14.71 to 15.23 | 0.7× | 26.90 s | 940 MiB |
| `tsc@6.0.3` | **47.45 s** | 47.14 to 47.82 | 0.2× | 79.09 s | 962 MiB |

## Diagnostics

Each checker's output on every config, compared with `tsgo@7.1.0-beta`.

| Checker | Result | Identical | Same after normalizing | Differs | Failed | Extra | Missing |
|---|---|--:|--:|--:|--:|--:|--:|
| `tsgo@7.1.0-beta` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `bun@1.4.3` | ✅ same errors | 0 | 11 | 0 | 0 | 0 | 0 |
| `tsc@6.0.3` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.6.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.7.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.8.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-ts@0.0.4` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-ts@0.0.5` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-ts@0.1.5` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
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
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | b28e4f0596403f4d |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 3ca243b8cb17159c |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | 9f9f7f370529577a |
| tsc-ts@0.1.5 | tsc-ts@0.1.5 | per-core | Version 7.1.0-beta | d737d5d36f5b6ed9 |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | f86e8070c267b12d |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 869ebb2d3a70f8d7 |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 0999c116eb963bd7 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | c35b772b949a6f2c |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | c35b772b949a6f2c |

## Conditions

- busy process: node-MainThread at 64.7% CPU
- busy process: node-MainThread at 132% CPU
