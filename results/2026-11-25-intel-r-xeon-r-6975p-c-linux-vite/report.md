# vite

> **`tsrs@0.16.0`** is **3.1×** faster than `tsgo@7.1.0-beta`: 2.90 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Intel(R) Xeon(R) 6975P-C, 4 cores, 15 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1014-aws), Node v26.13.1, CI runner `ubuntu-24.04` |
| **When** | 2026-11-25 13:01 UTC, 9 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-intel-r-xeon-r-6975p-c-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **2.90 s** | 2.82 to 2.92 | 3.1× | 5.37 s | 328 MiB |
| `tsrs@0.18.0` | **2.92 s** | 2.86 to 2.97 | 3.1× | 5.35 s | 327 MiB |
| `tsrs@0.20.1+fast` | **2.94 s** | 2.87 to 3.01 | 3.1× | 5.35 s | 303 MiB |
| `tsrs@0.20.1` | **3.19 s** | 3.15 to 3.21 | 2.8× | 5.17 s | 321 MiB |
| `bun@1.4.3` | **3.82 s** | 3.78 to 3.87 | 2.3× | 8.29 s | 220 MiB |
| `tsc-rs@0.7.0` | **4.23 s** | 4.16 to 4.27 | 2.1× | 7.32 s | 614 MiB |
| `tsc-rs@0.8.0` | **4.27 s** | 4.23 to 4.29 | 2.1× | 7.33 s | 614 MiB |
| `tsc-rs@0.6.0` | **4.28 s** | 4.17 to 4.46 | 2.1× | 7.37 s | 614 MiB |
| `tsc-ts@0.1.5` | **4.80 s** | 4.63 to 4.89 | 1.9× | 9.30 s | 383 MiB |
| `tsc-ts@0.0.5` | **6.97 s** | 6.79 to 7.08 | 1.3× | 13.72 s | 714 MiB |
| `tsc-ts@0.0.4` | **7.03 s** | 6.98 to 7.05 | 1.3× | 13.77 s | 725 MiB |
| `tsgo@7.1.0-beta` | **8.98 s** | 8.84 to 9.08 | 1.0× | 19.37 s | 696 MiB |
| `tsgo@7.0.2` | **12.49 s** | 11.90 to 12.54 | 0.7× | 25.99 s | 963 MiB |
| `tsc@6.0.3` | **34.23 s** | 1 round, baseline | 0.3× | 65.33 s | 965 MiB |

A baseline is timed in fewer rounds, without a warm-up of its own: it places the other checkers, and is not compared closely.

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | a183b1956edbe7e7 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 7ce7d6b654eddeec |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | a73dd4060c50d58c |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | fb9223ad1f59392c |
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | c2d321fe13ff304e |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 58ecee03cdda11e3 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | d7e50e89d0adcf0a |
| tsc-ts@0.1.5 | tsc-ts@0.1.5 | per-core | Version 7.1.0-beta | 40164176127376f1 |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 4f2de67828640175 |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | 0a5549ad15fc942c |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | d0bd720c20e99007 |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 0ce4f6cb4e95b24f |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 0ce4f6cb4e95b24f |

## Conditions

- busy process: node-MainThread at 60.6% CPU
- busy process: node-MainThread at 136% CPU
