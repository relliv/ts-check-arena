# vite

> **`tsrs@0.20.1+fast`** is **3.2×** faster than `tsgo@7.1.0-beta`: 3.99 s for one pass over 11 configs. 14 of 14 checkers report exactly the reference's diagnostics.

| | |
|---|---|
| **Machine** | Apple M1 (Virtual), 3 cores, 7 GiB |
| **System** | macOS 15.8.2 (24H232), Node v26.13.1, CI runner `macos-15` |
| **When** | 2026-11-25 09:53 UTC, 20 min |
| **Method** | median of 5 rounds after one warm-up; checker order rotated every round |
| **Configs** | 11 checked, 0 through a shadow config, 0 rejected |
| **Reference** | `tsgo@7.1.0-beta` |
| **Run** | `2026-11-25-0953-apple-m1-virtual-darwin-vite` |

## Speed, as shipped

One pass checks every config once, one after another. Wall and CPU time are summed over the pass; peak memory is the largest single config.

| Checker | Wall | Range | vs reference | CPU | Peak |
|---|--:|--:|--:|--:|--:|
| `tsrs@0.20.1+fast` | **3.99 s** | 3.37 to 4.36 | 3.2× | 5.93 s | 295 MiB |
| `tsrs@0.18.0` | **4.24 s** | 3.39 to 5.28 | 3.0× | 6.46 s | 316 MiB |
| `tsrs@0.16.0` | **4.37 s** | 3.33 to 4.65 | 2.9× | 6.81 s | 317 MiB |
| `tsrs@0.20.1` | **4.53 s** | 3.58 to 5.39 | 2.8× | 6.48 s | 309 MiB |
| `tsc-rs@0.7.0` | **5.52 s** | 4.35 to 8.65 | 2.3× | 8.24 s | 604 MiB |
| `tsc-rs@0.6.0` | **5.58 s** | 4.78 to 9.08 | 2.3× | 8.28 s | 603 MiB |
| `bun@1.4.3` | **5.74 s** | 4.38 to 7.77 | 2.2× | 10.08 s | 257 MiB |
| `tsc-rs@0.8.0` | **5.77 s** | 5.11 to 7.84 | 2.2× | 8.73 s | 604 MiB |
| `tsc-ts@0.1.5` | **8.95 s** | 6.25 to 13.48 | 1.4× | 13.00 s | 513 MiB |
| `tsc-ts@0.0.5` | **9.75 s** | 9.14 to 14.29 | 1.3× | 15.88 s | 691 MiB |
| `tsc-ts@0.0.4` | **10.45 s** | 9.63 to 14.87 | 1.2× | 16.07 s | 703 MiB |
| `tsgo@7.1.0-beta` | **12.85 s** | 10.53 to 17.52 | 1.0× | 21.69 s | 689 MiB |
| `tsgo@7.0.2` | **18.84 s** | 12.45 to 22.54 | 0.7× | 30.44 s | 960 MiB |
| `tsc@6.0.3` | **57.39 s** | 46.48 to 65.80 | 0.2× | 90.93 s | 968 MiB |

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

- load average 51.02 on 3 cores
- busy process: mdsync at 27.0% CPU
