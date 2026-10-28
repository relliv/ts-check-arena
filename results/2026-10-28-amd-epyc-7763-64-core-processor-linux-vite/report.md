# vite

> **`tsrs@0.16.0`** is **3.3×** faster than `tsgo@7.1.0-beta`: 3.88 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 7763 64-Core Processor, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (6.17.0-1022-azure), Node v24.21.0, CI runner `ubuntu-24.04` |
| **When** | 2026-10-28 10:55 UTC, 21 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-amd-epyc-7763-64-core-processor-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **3.88 s** | 3.74 to 3.96 | 3.3× | 7.41 s | 428 MiB |
| `tsrs@0.18.0` | **3.97 s** | 3.84 to 4.10 | 3.2× | 7.51 s | 427 MiB |
| `tsrs@0.20.1+fast` | **4.05 s** | 3.91 to 4.16 | 3.1× | 7.67 s | 433 MiB |
| `tsrs@0.20.1` | **4.18 s** | 4.13 to 4.39 | 3.0× | 7.04 s | 449 MiB |
| `tsc-rs@0.6.0` | **5.84 s** | 5.75 to 6.03 | 2.2× | 10.51 s | 631 MiB |
| `tsc-rs@0.7.0` | **5.98 s** | 5.67 to 6.13 | 2.1× | 10.60 s | 629 MiB |
| `bun@1.4.3` | **6.21 s** | 5.98 to 6.42 | 2.0× | 13.96 s | 215 MiB |
| `tsc-ts@0.0.4` | **11.47 s** | 11.27 to 11.60 | 1.1× | 23.65 s | 724 MiB |
| `tsc-ts@0.0.5` | **11.60 s** | 11.27 to 11.80 | 1.1× | 23.77 s | 719 MiB |
| `tsgo@7.1.0-beta` | **12.72 s** | 11.87 to 12.98 | 1.0× | 26.44 s | 698 MiB |
| `tsgo@7.0.2` | **15.90 s** | 15.37 to 16.75 | 0.8× | 34.07 s | 970 MiB |
| `tsc@6.0.3` | **50.89 s** | 50.45 to 52.15 | 0.2× | 95.89 s | 1072 MiB |

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | a183b1956edbe7e7 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 7ce7d6b654eddeec |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | a73dd4060c50d58c |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | fb9223ad1f59392c |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 58ecee03cdda11e3 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | d7e50e89d0adcf0a |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 4f2de67828640175 |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 0a5549ad15fc942c |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | d0bd720c20e99007 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 0ce4f6cb4e95b24f |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 0ce4f6cb4e95b24f |

## Conditions

- busy process: MainThread at 62.5% CPU
- busy process: MainThread at 120% CPU
