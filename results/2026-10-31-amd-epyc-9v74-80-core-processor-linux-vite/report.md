# vite

> **`tsrs@0.18.0`** is **3.5×** faster than `tsgo@7.1.0-beta`: 3.91 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 9V74 80-Core Processor, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1017-azure), Node v26.13.0, CI runner `ubuntu-24.04` |
| **When** | 2026-10-31 14:33 UTC, 16 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-31-amd-epyc-9v74-80-core-processor-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.18.0` | **3.91 s** | 3.87 to 4.09 | 3.5× | 7.39 s | 324 MiB |
| `tsrs@0.20.1+fast` | **3.98 s** | 3.95 to 4.10 | 3.4× | 7.39 s | 304 MiB |
| `tsrs@0.16.0` | **4.01 s** | 3.87 to 4.03 | 3.4× | 7.40 s | 324 MiB |
| `tsrs@0.20.1` | **4.26 s** | 4.21 to 4.39 | 3.2× | 6.98 s | 318 MiB |
| `tsc-rs@0.6.0` | **5.57 s** | 5.52 to 6.01 | 2.4× | 9.69 s | 609 MiB |
| `tsc-rs@0.7.0` | **5.58 s** | 5.54 to 5.99 | 2.4× | 9.72 s | 609 MiB |
| `bun@1.4.3` | **5.66 s** | 5.64 to 5.84 | 2.4× | 12.42 s | 212 MiB |
| `tsc-ts@0.0.5` | **10.29 s** | 10.18 to 10.70 | 1.3× | 20.82 s | 716 MiB |
| `tsc-ts@0.0.4` | **10.45 s** | 10.24 to 10.59 | 1.3× | 21.11 s | 723 MiB |
| `tsgo@7.1.0-beta` | **13.52 s** | 13.40 to 14.07 | 1.0× | 28.62 s | 676 MiB |
| `tsgo@7.0.2` | **17.86 s** | 17.54 to 18.92 | 0.8× | 37.85 s | 964 MiB |
| `tsc@6.0.3` | **49.14 s** | 48.70 to 50.52 | 0.3× | 90.40 s | 967 MiB |

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

- busy process: node-MainThread at 62.1% CPU
- busy process: node-MainThread at 125% CPU
