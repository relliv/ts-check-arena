# vite

> **`tsrs@0.20.1+fast`** is **2.7×** faster than `tsgo@7.1.0-beta`: 4.14 s for one pass over 11 configs. 10 of 10 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 9V74 80-Core Processor, 4 cores, 16 GiB |
| **System** | Windows Server 2025 Datacenter (10.0.26100), Node v26.13.0, CI runner `windows-2025` |
| **When** | 2026-10-31 14:35 UTC, 20 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-31-amd-epyc-9v74-80-core-processor-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **4.14 s** | 4.10 to 4.35 | 2.7× | 8.17 s | 364 MiB |
| `tsrs@0.20.1` | **4.43 s** | 4.41 to 4.56 | 2.5× | 8.03 s | 383 MiB |
| `bun@1.4.3` | **4.64 s** | 4.63 to 4.97 | 2.4× | 10.70 s | 204 MiB |
| `tsc-rs@0.7.0` | **6.42 s** | 6.36 to 6.61 | 1.7× | 11.94 s | 601 MiB |
| `tsc-rs@0.6.0` | **6.44 s** | 6.41 to 6.98 | 1.7× | 12.11 s | 602 MiB |
| `tsgo@7.1.0-beta` | **11.08 s** | 11.05 to 11.61 | 1.0× | 22.78 s | 695 MiB |
| `tsc-ts@0.0.5` | **12.27 s** | 12.22 to 12.62 | 0.9× | 26.30 s | 754 MiB |
| `tsc-ts@0.0.4` | **12.43 s** | 12.25 to 13.19 | 0.9× | 26.56 s | 760 MiB |
| `tsgo@7.0.2` | **14.85 s** | 14.61 to 15.26 | 0.7× | 30.42 s | 944 MiB |
| `tsc@6.0.3` | **38.73 s** | 38.58 to 44.36 | 0.3× | 68.13 s | 932 MiB |

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 498f59d207e22c40 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 095db4abae203d42 |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | edbe6ea55bea1d51 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 19097a55fb2407bd |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | 0cf944499ae1db59 |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | fb3f0b0dd59ec179 |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | f9ecfbdc93753d2c |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f84fb09f51fd7c20 |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | f84fb09f51fd7c20 |
