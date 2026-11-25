# vite

> **`tsrs@0.20.1+fast`** is **2.9×** faster than `tsgo@7.1.0-beta`: 2.96 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 9V45 96-Core Processor, 4 cores, 16 GiB |
| **System** | Windows Server 2025 Datacenter (10.0.26100), Node v26.13.1, CI runner `windows-2025` |
| **When** | 2026-11-25 09:54 UTC, 17 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-amd-epyc-9v45-96-core-processor-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **2.96 s** | 2.89 to 3.08 | 2.9× | 6.00 s | 364 MiB |
| `tsrs@0.20.1` | **3.19 s** | 3.06 to 3.26 | 2.7× | 5.66 s | 382 MiB |
| `bun@1.4.3` | **3.46 s** | 3.34 to 3.74 | 2.5× | 7.70 s | 213 MiB |
| `tsc-rs@0.7.0` | **4.51 s** | 4.49 to 4.85 | 1.9× | 8.63 s | 602 MiB |
| `tsc-rs@0.8.0` | **4.56 s** | 4.48 to 4.65 | 1.9× | 8.50 s | 601 MiB |
| `tsc-rs@0.6.0` | **4.58 s** | 4.42 to 4.90 | 1.9× | 8.66 s | 602 MiB |
| `tsc-ts@0.1.5` | **7.15 s** | 6.93 to 7.50 | 1.2× | 14.67 s | 579 MiB |
| `tsgo@7.1.0-beta` | **8.56 s** | 8.39 to 8.76 | 1.0× | 17.81 s | 695 MiB |
| `tsc-ts@0.0.4` | **8.85 s** | 8.48 to 8.98 | 1.0× | 18.97 s | 762 MiB |
| `tsc-ts@0.0.5` | **8.95 s** | 8.56 to 9.21 | 1.0× | 19.09 s | 755 MiB |
| `tsgo@7.0.2` | **11.50 s** | 10.95 to 11.69 | 0.7× | 23.05 s | 956 MiB |
| `tsc@6.0.3` | **30.16 s** | 29.18 to 31.12 | 0.3× | 55.52 s | 922 MiB |

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
