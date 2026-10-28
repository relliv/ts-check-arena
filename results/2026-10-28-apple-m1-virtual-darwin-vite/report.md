# vite

> **`tsrs@0.18.0`** is **3.0×** faster than `tsgo@7.1.0-beta`: 4.33 s for one pass over 11 configs. 12 of 12 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M1 (Virtual), 3 cores, 7 GiB |
| **System** | macOS 15.7.9 (24G830), Node v24.20.0, CI runner `macos-15` |
| **When** | 2026-10-28 10:56 UTC, 22 min |
| **Method** | median of 7 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-10-28-apple-m1-virtual-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.18.0` | **4.33 s** | 4.08 to 4.90 | 3.0× | 6.38 s | 317 MiB |
| `tsrs@0.16.0` | **4.58 s** | 4.05 to 5.29 | 2.8× | 6.64 s | 316 MiB |
| `tsrs@0.20.1+fast` | **4.68 s** | 3.72 to 5.03 | 2.8× | 7.16 s | 293 MiB |
| `tsrs@0.20.1` | **4.90 s** | 3.89 to 5.05 | 2.7× | 6.45 s | 309 MiB |
| `bun@1.4.3` | **5.20 s** | 4.77 to 5.62 | 2.5× | 8.61 s | 257 MiB |
| `tsc-rs@0.7.0` | **6.87 s** | 5.93 to 7.70 | 1.9× | 10.19 s | 604 MiB |
| `tsc-rs@0.6.0` | **7.21 s** | 6.40 to 9.08 | 1.8× | 10.31 s | 603 MiB |
| `tsc-ts@0.0.4` | **11.79 s** | 10.51 to 12.31 | 1.1× | 18.59 s | 700 MiB |
| `tsc-ts@0.0.5` | **12.10 s** | 11.19 to 13.89 | 1.1× | 18.71 s | 692 MiB |
| `tsgo@7.1.0-beta` | **13.02 s** | 12.28 to 13.82 | 1.0× | 22.20 s | 690 MiB |
| `tsgo@7.0.2` | **19.84 s** | 17.95 to 21.15 | 0.7× | 31.25 s | 958 MiB |
| `tsc@6.0.3` | **55.26 s** | 50.34 to 59.29 | 0.2× | 92.70 s | 1060 MiB |

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

- load average 42.04 on 3 cores
