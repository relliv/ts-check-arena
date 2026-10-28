# vite

> **`tsrs@0.20.1+fast`** is **2.7×** faster than `tsgo@7.1.0-beta`: 4.05 s for one pass over 11 configs. 10 of 10 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | AMD EPYC 9V74 80-Core Processor, 4 cores, 16 GiB |
| **System** | Windows Server 2025 Datacenter (10.0.26100), Node v24.22.1, CI runner `windows-2025` |
| **When** | 2026-10-28 10:57 UTC, 26 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-amd-epyc-9v74-80-core-processor-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **4.05 s** | 3.97 to 4.08 | 2.7× | 8.06 s | 364 MiB |
| `tsrs@0.20.1` | **4.30 s** | 4.23 to 4.42 | 2.6× | 7.70 s | 382 MiB |
| `bun@1.4.3` | **4.60 s** | 4.57 to 5.20 | 2.4× | 10.67 s | 206 MiB |
| `tsc-rs@0.7.0` | **6.23 s** | 6.15 to 6.47 | 1.8× | 11.72 s | 601 MiB |
| `tsc-rs@0.6.0` | **6.36 s** | 6.25 to 6.47 | 1.7× | 11.94 s | 602 MiB |
| `tsgo@7.1.0-beta` | **11.06 s** | 10.99 to 11.12 | 1.0× | 22.73 s | 692 MiB |
| `tsc-ts@0.0.5` | **12.10 s** | 12.01 to 12.21 | 0.9× | 25.77 s | 756 MiB |
| `tsc-ts@0.0.4` | **12.14 s** | 12.08 to 12.26 | 0.9× | 25.95 s | 761 MiB |
| `tsgo@7.0.2` | **14.70 s** | 14.45 to 14.74 | 0.8× | 30.50 s | 937 MiB |
| `tsc@6.0.3` | **40.60 s** | 40.39 to 44.99 | 0.3× | 77.45 s | 1016 MiB |

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
