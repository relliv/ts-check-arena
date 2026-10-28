# vite

> **`tsrs@0.20.1+fast`** is **2.8×** faster than `tsgo@7.1.0-beta`: 8.23 s for one pass over 11 configs. 10 of 10 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Intel(R) Core(TM) i7-8700B CPU @ 3.20GHz, 4 cores, 14 GiB |
| **System** | macOS 15.7.9 (24G830), Node v24.19.0, CI runner `macos-15-intel` |
| **When** | 2026-10-28 10:57 UTC, 38 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-intel-r-core-tm-i7-8700b-cpu-3-20ghz-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **8.23 s** | 8.02 to 8.74 | 2.8× | 15.15 s | 288 MiB |
| `tsrs@0.20.1` | **9.20 s** | 8.78 to 10.01 | 2.5× | 14.98 s | 302 MiB |
| `bun@1.4.3` | **9.79 s** | 8.74 to 10.42 | 2.3× | 21.25 s | 244 MiB |
| `tsc-rs@0.6.0` | **13.22 s** | 11.36 to 16.04 | 1.7× | 22.66 s | 585 MiB |
| `tsc-rs@0.7.0` | **13.31 s** | 11.35 to 14.06 | 1.7× | 22.55 s | 586 MiB |
| `tsgo@7.1.0-beta` | **23.01 s** | 21.79 to 23.42 | 1.0× | 44.50 s | 672 MiB |
| `tsc-ts@0.0.4` | **25.52 s** | 18.65 to 26.36 | 0.9× | 46.38 s | 686 MiB |
| `tsc-ts@0.0.5` | **25.98 s** | 20.77 to 27.32 | 0.9× | 47.90 s | 682 MiB |
| `tsgo@7.0.2` | **32.61 s** | 27.73 to 36.08 | 0.7× | 60.14 s | 941 MiB |
| `tsc@6.0.3` | **94.76 s** | 87.38 to 98.45 | 0.2× | 162.56 s | 1020 MiB |

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
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 9d59d48abb19c153 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | 6f2884ee5028b1ba |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 76e4987d060ef820 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f31f2a9f56a061cc |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f31f2a9f56a061cc |

## Conditions

- load average 10.30 on 4 cores
- busy process: mds at 55.2% CPU
- busy process: mds_stores at 161.0% CPU
