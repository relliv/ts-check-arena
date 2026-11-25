# vite

> **`bun@1.4.3`** is **2.4×** faster than `tsgo@7.1.0-beta`: 4.84 s for one pass over 11 configs. 7 of 7 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Cobalt 100, 4 cores, 16 GiB |
| **System** | Windows 11 Enterprise (10.0.26200), Node v26.13.1, CI runner `windows-11-arm` |
| **When** | 2026-11-25 09:54 UTC, 18 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-cobalt-100-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `bun@1.4.3` | **4.84 s** | 4.70 to 4.88 | 2.4× | 9.84 s | 205 MiB |
| `tsc-rs@0.8.0` | **6.58 s** | 6.52 to 6.78 | 1.8× | 11.66 s | 608 MiB |
| `tsc-rs@0.6.0` | **6.72 s** | 6.56 to 6.79 | 1.7× | 12.09 s | 608 MiB |
| `tsc-rs@0.7.0` | **6.74 s** | 6.54 to 6.84 | 1.7× | 11.86 s | 608 MiB |
| `tsgo@7.1.0-beta` | **11.64 s** | 11.51 to 12.03 | 1.0× | 22.03 s | 692 MiB |
| `tsgo@7.0.2` | **16.05 s** | 15.85 to 16.73 | 0.7× | 29.02 s | 968 MiB |
| `tsc@6.0.3` | **50.53 s** | 49.79 to 51.98 | 0.2× | 82.73 s | 946 MiB |

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
| `tsgo@7.0.2` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |

Extra: diagnostics only that checker reported. Missing: diagnostics only the reference reported. The full output of every differing config is in parity/.

## Checkers

| Checker | Package | Default threads | Version output | Binary sha256 |
|---|---|---|---|---|
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 56d73f78be9efa2c |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | b662cf80f9328660 |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | 214d4dddaff9d5e3 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 620d712a8a8a629c |
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | b409237058a8c25c |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 2ec832b3d17ce256 |
