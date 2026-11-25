# vite

> **`tsrs@0.16.0`** is **3.4×** faster than `tsgo@7.1.0-beta`: 2.97 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 9V74 80-Core Processor, 4 cores, 16 GiB |
| **System** | Ubuntu 24.04.5 LTS (7.0.0-1017-azure), Node v26.13.1, CI runner `ubuntu-24.04` |
| **When** | 2026-11-25 09:53 UTC, 13 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-amd-epyc-9v74-80-core-processor-linux-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.16.0` | **2.97 s** | 2.94 to 2.99 | 3.4× | 5.53 s | 326 MiB |
| `tsrs@0.18.0` | **3.02 s** | 2.99 to 3.02 | 3.4× | 5.60 s | 324 MiB |
| `tsrs@0.20.1+fast` | **3.04 s** | 3.02 to 3.05 | 3.4× | 5.63 s | 305 MiB |
| `tsrs@0.20.1` | **3.30 s** | 3.24 to 3.32 | 3.1× | 5.34 s | 318 MiB |
| `tsc-rs@0.7.0` | **4.26 s** | 4.23 to 4.28 | 2.4× | 7.40 s | 614 MiB |
| `tsc-rs@0.6.0` | **4.27 s** | 4.24 to 4.29 | 2.4× | 7.41 s | 614 MiB |
| `tsc-rs@0.8.0` | **4.32 s** | 4.29 to 4.35 | 2.4× | 7.42 s | 616 MiB |
| `bun@1.4.3` | **4.35 s** | 4.33 to 4.43 | 2.3× | 9.54 s | 216 MiB |
| `tsc-ts@0.1.5` | **5.09 s** | 5.07 to 5.10 | 2.0× | 10.07 s | 384 MiB |
| `tsc-ts@0.0.5` | **7.90 s** | 7.87 to 7.93 | 1.3× | 16.01 s | 714 MiB |
| `tsc-ts@0.0.4` | **8.02 s** | 7.97 to 8.03 | 1.3× | 16.17 s | 722 MiB |
| `tsgo@7.1.0-beta` | **10.21 s** | 10.14 to 10.25 | 1.0× | 21.28 s | 686 MiB |
| `tsgo@7.0.2` | **13.63 s** | 13.51 to 13.78 | 0.7× | 29.06 s | 926 MiB |
| `tsc@6.0.3` | **38.00 s** | 37.93 to 38.50 | 0.3× | 69.73 s | 984 MiB |

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

- busy process: node-MainThread at 60.3% CPU
- busy process: node-MainThread at 128% CPU
