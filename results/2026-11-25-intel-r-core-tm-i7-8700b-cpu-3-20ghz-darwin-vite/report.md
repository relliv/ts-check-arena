# vite

> **`tsrs@0.20.1+fast`** is **2.8×** faster than `tsgo@7.1.0-beta`: 5.91 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Intel(R) Core(TM) i7-8700B CPU @ 3.20GHz, 4 cores, 14 GiB |
| **System** | macOS 15.7.9 (24G830), Node v26.13.1, CI runner `macos-15-intel` |
| **When** | 2026-11-25 09:54 UTC, 25 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-intel-r-core-tm-i7-8700b-cpu-3-20ghz-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **5.91 s** | 5.35 to 7.09 | 2.8× | 11.01 s | 288 MiB |
| `tsrs@0.20.1` | **6.18 s** | 5.16 to 7.45 | 2.6× | 9.95 s | 304 MiB |
| `bun@1.4.3` | **6.92 s** | 5.30 to 11.63 | 2.4× | 14.01 s | 242 MiB |
| `tsc-rs@0.6.0` | **8.85 s** | 7.35 to 10.97 | 1.8× | 15.21 s | 586 MiB |
| `tsc-rs@0.8.0` | **8.91 s** | 8.10 to 10.65 | 1.8× | 15.44 s | 586 MiB |
| `tsc-rs@0.7.0` | **9.90 s** | 7.29 to 11.10 | 1.6× | 17.60 s | 586 MiB |
| `tsc-ts@0.1.5` | **13.39 s** | 12.29 to 20.86 | 1.2× | 24.11 s | 502 MiB |
| `tsgo@7.1.0-beta` | **16.32 s** | 13.94 to 17.82 | 1.0× | 31.27 s | 684 MiB |
| `tsc-ts@0.0.5` | **16.86 s** | 14.05 to 24.55 | 1.0× | 31.40 s | 681 MiB |
| `tsc-ts@0.0.4` | **17.42 s** | 16.00 to 20.22 | 0.9× | 32.61 s | 687 MiB |
| `tsgo@7.0.2` | **20.86 s** | 17.05 to 23.96 | 0.8× | 39.29 s | 940 MiB |
| `tsc@6.0.3` | **71.10 s** | 52.37 to 74.61 | 0.2× | 122.70 s | 946 MiB |

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
| `tsrs@0.20.1` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.20.1+fast` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |

Extra: diagnostics only that checker reported. Missing: diagnostics only the reference reported. The full output of every differing config is in parity/.

## Checkers

| Checker | Package | Default threads | Version output | Binary sha256 |
|---|---|---|---|---|
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 57e8068d9b0398b8 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | c2a945a9d33f9088 |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | 04df698202902210 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 20472cb2a0d18418 |
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | 466d1b2ca8697dd1 |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 9d59d48abb19c153 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | 6f2884ee5028b1ba |
| tsc-ts@0.1.5 | tsc-ts@0.1.5 | per-core | Version 7.1.0-beta | 596c8914bb46f049 |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 76e4987d060ef820 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f31f2a9f56a061cc |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f31f2a9f56a061cc |

## Conditions

- load average 17.40 on 4 cores
- busy process: mds at 30.3% CPU
- busy process: mds_stores at 67.2% CPU
