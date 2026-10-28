# vite

> **`bun@1.4.3`** is **2.5×** faster than `tsgo@7.1.0-beta`: 4.79 s for one pass over 11 configs. 6 of 6 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Cobalt 100, 4 cores, 16 GiB |
| **System** | Windows 11 Enterprise (10.0.26200), Node v24.22.1, CI runner `windows-11-arm` |
| **When** | 2026-10-28 10:58 UTC, 23 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-cobalt-100-win32-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `bun@1.4.3` | **4.79 s** | 4.59 to 4.99 | 2.5× | 10.05 s | 203 MiB |
| `tsc-rs@0.7.0` | **6.64 s** | 6.47 to 7.25 | 1.8× | 11.81 s | 609 MiB |
| `tsc-rs@0.6.0` | **6.72 s** | 6.53 to 7.02 | 1.8× | 12.13 s | 608 MiB |
| `tsgo@7.1.0-beta` | **12.09 s** | 11.60 to 12.18 | 1.0× | 22.77 s | 691 MiB |
| `tsgo@7.0.2` | **16.98 s** | 16.22 to 17.27 | 0.7× | 30.63 s | 945 MiB |
| `tsc@6.0.3` | **53.32 s** | 51.87 to 55.84 | 0.2× | 91.72 s | 914 MiB |

## Diagnostics

Each checker's output on every config, compared with `tsgo@7.1.0-beta`.

| Checker | Result | Identical | Same after normalizing | Differs | Failed | Extra | Missing |
|---|---|--:|--:|--:|--:|--:|--:|
| `tsgo@7.1.0-beta` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `bun@1.4.3` | ✅ same errors | 0 | 11 | 0 | 0 | 0 | 0 |
| `tsc@6.0.3` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.6.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
| `tsc-rs@0.7.0` | ✅ identical | 11 | 0 | 0 | 0 | 0 | 0 |
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
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | 2ec832b3d17ce256 |
