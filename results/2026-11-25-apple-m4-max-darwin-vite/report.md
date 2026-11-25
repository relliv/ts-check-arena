# vite

> **`tsrs@0.18.0`** is **3.2×** faster than `tsgo@7.1.0-beta`: 1.28 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M4 Max, 16 cores, 48 GiB |
| **System** | macOS 27.0.1 (26A434), Node v26.0.0, local machine |
| **When** | 2026-11-25 10:33 UTC, 6 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-apple-m4-max-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.18.0` | **1.28 s** | 1.26 to 1.35 | 3.2× | 3.83 s | 379 MiB |
| `tsrs@0.20.1+fast` | **1.30 s** | 1.29 to 1.31 | 3.2× | 3.84 s | 350 MiB |
| `tsrs@0.16.0` | **1.30 s** | 1.24 to 1.31 | 3.1× | 4.06 s | 378 MiB |
| `tsrs@0.20.1` | **1.55 s** | 1.53 to 1.64 | 2.6× | 3.41 s | 320 MiB |
| `bun@1.4.3` | **1.59 s** | 1.58 to 1.62 | 2.6× | 4.82 s | 360 MiB |
| `tsc-rs@0.8.0` | **1.94 s** | 1.93 to 2.01 | 2.1× | 3.44 s | 610 MiB |
| `tsc-rs@0.6.0` | **1.98 s** | 1.93 to 1.99 | 2.1× | 3.55 s | 611 MiB |
| `tsc-rs@0.7.0` | **1.99 s** | 1.96 to 2.00 | 2.1× | 3.46 s | 611 MiB |
| `tsc-ts@0.1.5` | **2.53 s** | 2.46 to 2.57 | 1.6× | 6.66 s | 591 MiB |
| `tsc-ts@0.0.5` | **3.52 s** | 3.48 to 3.69 | 1.2× | 8.32 s | 769 MiB |
| `tsc-ts@0.0.4` | **3.53 s** | 3.45 to 3.56 | 1.2× | 8.35 s | 782 MiB |
| `tsgo@7.1.0-beta` | **4.10 s** | 4.05 to 4.18 | 1.0× | 9.98 s | 690 MiB |
| `tsgo@7.0.2` | **5.53 s** | 5.36 to 5.70 | 0.7× | 12.98 s | 946 MiB |
| `tsc@6.0.3` | **15.85 s** | 15.71 to 16.38 | 0.3× | 31.32 s | 1036 MiB |

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 29f5eb8daa5c8cf6 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 28c7dd0a06916aba |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | 83024f4dec342995 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 23dd7b5cf77478cd |
| tsc-rs@0.8.0 | tsc-rs@0.8.0 | 4 | Version 7.1.0-dev | a339af800cf53321 |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | fe7255e19cf2872d |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | dc23e6e23c7a418f |
| tsc-ts@0.1.5 | tsc-ts@0.1.5 | per-core | Version 7.1.0-beta | b51b03262349c0ec |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | a82f731365ad69d5 |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | c04e14af7538fd95 |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | b3f1c65d555aa0db |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |

## Conditions

- busy process: com.apple.Virtualization.VirtualMachine at 32.4% CPU
- node_modules above the target in ~
