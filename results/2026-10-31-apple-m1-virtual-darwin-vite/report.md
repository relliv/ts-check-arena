# vite

> **`tsrs@0.20.1+fast`** is **3.2×** faster than `tsgo@7.1.0-beta`: 3.03 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M1 (Virtual), 3 cores, 7 GiB |
| **System** | macOS 15.8.2 (24H232), Node v26.13.0, CI runner `macos-15` |
| **When** | 2026-10-31 14:34 UTC, 13 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-31-apple-m1-virtual-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **3.03 s** | 2.52 to 4.09 | 3.2× | 4.80 s | 294 MiB |
| `tsrs@0.16.0` | **3.39 s** | 2.15 to 4.42 | 2.9× | 5.16 s | 317 MiB |
| `tsrs@0.18.0` | **3.47 s** | 2.26 to 5.97 | 2.8× | 5.56 s | 314 MiB |
| `bun@1.4.3` | **3.76 s** | 3.54 to 4.06 | 2.6× | 6.64 s | 256 MiB |
| `tsrs@0.20.1` | **3.88 s** | 2.76 to 5.42 | 2.5× | 5.33 s | 308 MiB |
| `tsc-rs@0.6.0` | **5.08 s** | 3.79 to 6.53 | 1.9× | 7.57 s | 603 MiB |
| `tsc-rs@0.7.0` | **5.35 s** | 3.95 to 5.82 | 1.8× | 7.86 s | 604 MiB |
| `tsc-ts@0.0.5` | **9.34 s** | 8.31 to 13.79 | 1.0× | 15.25 s | 690 MiB |
| `tsgo@7.1.0-beta` | **9.72 s** | 8.27 to 11.51 | 1.0× | 16.90 s | 695 MiB |
| `tsc-ts@0.0.4` | **9.81 s** | 8.34 to 11.70 | 1.0× | 15.43 s | 701 MiB |
| `tsgo@7.0.2` | **16.42 s** | 11.39 to 18.29 | 0.6× | 26.34 s | 949 MiB |
| `tsc@6.0.3` | **44.33 s** | 29.80 to 49.01 | 0.2× | 72.37 s | 970 MiB |

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
| tsgo@7.1.0-beta | typescript@7.1.0-beta | 4 | Version 7.1.0-beta | 29f5eb8daa5c8cf6 |
| bun@1.4.3 | bun@1.4.3 | per-core | 1.4.3 | 28c7dd0a06916aba |
| tsc@6.0.3 | typescript@6.0.3 | 1 | Version 6.0.3 | 2cffde0b8c6760df |
| tsc-rs@0.6.0 | tsc-rs@0.6.0 | 4 | Version 7.1.0-dev | 83024f4dec342995 |
| tsc-rs@0.7.0 | tsc-rs@0.7.0 | 4 | Version 7.1.0-dev | 23dd7b5cf77478cd |
| tsc-ts@0.0.4 | tsc-ts@0.0.4 | per-core | Version 7.0.2 | fe7255e19cf2872d |
| tsc-ts@0.0.5 | tsc-ts@0.0.5 | per-core | Version 7.0.2 | dc23e6e23c7a418f |
| tsgo@7.0.2 | typescript@7.0.2 | 4 | Version 7.0.2 | a82f731365ad69d5 |
| tsrs@0.16.0-ts7.1.0-dev.20260929 | tsrs@0.16.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.16.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | c04e14af7538fd95 |
| tsrs@0.18.0-ts7.1.0-dev.20260929 | tsrs@0.18.0-ts7.1.0-dev.20260929 | per-core | Version 7.1.0-dev.20260930.4 (tsrs 0.18.0-ts7.1.0-dev.20260929, microsoft/TypeScript@b85298b6a81f) | b3f1c65d555aa0db |
| tsrs@0.20.1-ts7.1.0-beta | tsrs@0.20.1-ts7.1.0-beta | 4 | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |
| tsrs@0.20.1-ts7.1.0-beta+fast | tsrs@0.20.1-ts7.1.0-beta with `--fast` | set by the mode | Version 7.1.0-beta (tsrs 0.20.1-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9) | 5c1f6789358b9947 |

## Conditions

- load average 37.02 on 3 cores
