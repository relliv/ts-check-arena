# vite

> **`tsrs@0.20.1+fast`** is **2.8×** faster than `tsgo@7.1.0-beta`: 5.11 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 7763 64-Core Processor, 4 cores, 16 GiB |
| **System** | Windows Server 2025 Datacenter (10.0.26100), Node v26.13.1, CI runner `windows-2025` |
| **When** | 2026-11-25 13:02 UTC, 23 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-amd-epyc-7763-64-core-processor-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **5.11 s** | 5.06 to 5.22 | 2.8× | 10.64 s | 365 MiB |
| `tsrs@0.20.1` | **5.45 s** | 5.41 to 5.47 | 2.7× | 10.09 s | 382 MiB |
| `bun@1.4.3` | **6.19 s** | 6.18 to 6.23 | 2.3× | 14.72 s | 202 MiB |
| `tsc-rs@0.7.0` | **7.69 s** | 7.63 to 8.82 | 1.9× | 14.73 s | 601 MiB |
| `tsc-rs@0.8.0` | **7.70 s** | 7.64 to 7.78 | 1.9× | 14.88 s | 602 MiB |
| `tsc-rs@0.6.0` | **7.86 s** | 7.80 to 10.19 | 1.8× | 15.05 s | 602 MiB |
| `tsc-ts@0.1.5` | **12.74 s** | 12.72 to 12.76 | 1.1× | 26.44 s | 578 MiB |
| `tsgo@7.1.0-beta` | **14.48 s** | 14.39 to 14.51 | 1.0× | 30.73 s | 687 MiB |
| `tsc-ts@0.0.4` | **15.75 s** | 15.65 to 15.82 | 0.9× | 34.64 s | 761 MiB |
| `tsc-ts@0.0.5` | **15.86 s** | 15.78 to 16.84 | 0.9× | 34.83 s | 755 MiB |
| `tsgo@7.0.2` | **18.51 s** | 18.42 to 18.68 | 0.8× | 39.30 s | 948 MiB |
| `tsc@6.0.3` | **51.54 s** | 1 round, baseline | 0.3× | 87.39 s | 944 MiB |

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
| `tsrs@0.20.1` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsrs@0.20.1+fast` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |

Extra: diagnostics only that checker reported. Missing: diagnostics only the reference reported. The full output of every differing config is in parity/.

## Checkers

| Checker | Package | Default threads | Version output | Binary sha256 |
|---|---|---|---|---|
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 498f59d207e22c40 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 095db4abae203d42 |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | edbe6ea55bea1d51 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 19097a55fb2407bd |
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | f4bbe99943b8a718 |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 0cf944499ae1db59 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | fb3f0b0dd59ec179 |
| tsc-ts@0.1.5 | tsc-ts@0.1.5 | per-core | Version 7.1.0-beta | d69bb4187d312be5 |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | f9ecfbdc93753d2c |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f84fb09f51fd7c20 |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f84fb09f51fd7c20 |
