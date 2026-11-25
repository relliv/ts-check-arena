# vite

> **`tsrs@0.20.1`** is **3.1×** faster than `tsgo@7.1.0-beta`: 3.65 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M1 (Virtual), 3 cores, 7 GiB |
| **System** | macOS 15.8.2 (24H232), Node v26.13.1, CI runner `macos-15` |
| **When** | 2026-11-25 13:01 UTC, 11 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-apple-m1-virtual-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1` | **3.65 s** | 3.46 to 5.41 | 3.1× | 5.40 s | 308 MiB |
| `tsrs@0.18.0` | **3.65 s** | 2.77 to 5.45 | 3.1× | 5.63 s | 315 MiB |
| `tsrs@0.20.1+fast` | **3.80 s** | 2.66 to 5.65 | 3.0× | 5.86 s | 294 MiB |
| `tsrs@0.16.0` | **4.31 s** | 3.19 to 6.46 | 2.6× | 5.61 s | 318 MiB |
| `bun@1.4.3` | **4.84 s** | 3.53 to 5.13 | 2.3× | 7.98 s | 258 MiB |
| `tsc-rs@0.8.0` | **5.31 s** | 4.37 to 6.25 | 2.1× | 7.70 s | 604 MiB |
| `tsc-rs@0.7.0` | **5.42 s** | 4.70 to 6.13 | 2.1× | 8.43 s | 604 MiB |
| `tsc-rs@0.6.0` | **5.99 s** | 4.61 to 6.43 | 1.9× | 8.80 s | 603 MiB |
| `tsc-ts@0.1.5` | **7.14 s** | 6.43 to 7.98 | 1.6× | 11.12 s | 514 MiB |
| `tsc-ts@0.0.5` | **10.19 s** | 6.60 to 10.76 | 1.1× | 16.04 s | 691 MiB |
| `tsc-ts@0.0.4` | **10.54 s** | 7.71 to 11.88 | 1.1× | 16.44 s | 702 MiB |
| `tsgo@7.1.0-beta` | **11.34 s** | 9.20 to 12.64 | 1.0× | 19.67 s | 687 MiB |
| `tsgo@7.0.2` | **17.88 s** | 15.49 to 21.44 | 0.6× | 28.55 s | 962 MiB |
| `tsc@6.0.3` | **40.93 s** | 1 round, baseline | 0.3× | 67.04 s | 971 MiB |

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

- load average 49.45 on 3 cores
- busy process: trustd at 26.8% CPU
