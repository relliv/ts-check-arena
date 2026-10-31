# vite

> **`tsrs@0.20.1`** is **2.8×** faster than `tsgo@7.1.0-beta`: 5.42 s for one pass over 11 configs. 10 of 10 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Intel(R) Core(TM) i7-8700B CPU @ 3.20GHz, 4 cores, 14 GiB |
| **System** | macOS 15.7.9 (24G830), Node v26.13.0, CI runner `macos-15-intel` |
| **When** | 2026-10-31 14:35 UTC, 20 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-31-intel-r-core-tm-i7-8700b-cpu-3-20ghz-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1` | **5.42 s** | 5.00 to 6.77 | 2.8× | 8.62 s | 303 MiB |
| `bun@1.4.3` | **5.74 s** | 5.07 to 7.46 | 2.6× | 12.09 s | 239 MiB |
| `tsrs@0.20.1+fast` | **6.47 s** | 4.57 to 7.99 | 2.3× | 11.40 s | 289 MiB |
| `tsc-rs@0.6.0` | **8.97 s** | 7.43 to 9.13 | 1.7× | 15.00 s | 586 MiB |
| `tsc-rs@0.7.0` | **9.32 s** | 7.88 to 12.48 | 1.6× | 16.09 s | 586 MiB |
| `tsgo@7.1.0-beta` | **15.11 s** | 12.06 to 19.28 | 1.0× | 29.74 s | 671 MiB |
| `tsc-ts@0.0.4` | **16.84 s** | 15.48 to 17.32 | 0.9× | 31.17 s | 689 MiB |
| `tsc-ts@0.0.5` | **18.32 s** | 14.65 to 20.47 | 0.8× | 30.68 s | 682 MiB |
| `tsgo@7.0.2` | **20.58 s** | 16.72 to 26.63 | 0.7× | 39.88 s | 959 MiB |
| `tsc@6.0.3` | **60.57 s** | 53.82 to 65.67 | 0.2× | 105.92 s | 948 MiB |

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

- load average 12.67 on 4 cores
- busy process: mds at 29.3% CPU
- busy process: mds_stores at 69.1% CPU
