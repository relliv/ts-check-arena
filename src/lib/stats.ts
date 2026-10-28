// The rules that turn timed runs into reported numbers. Covered by test/stats.test.ts.

export interface Timing {
  /** Wall seconds. */
  real: number;
  user: number;
  sys: number;
  /** Peak memory in bytes. */
  maxrss: number;
}

export interface Measured extends Timing {
  exit: number;
}

export interface Summary {
  runs: number;
  /** Median wall seconds, with the min and max of the set. */
  median: number;
  min: number;
  max: number;
  /** Median user+sys seconds. */
  cpu: number;
  /** Median peak memory, MiB. */
  rssMiB: number;
}

/** Median of an odd-length list. Throws on even lengths rather than picking a convention. */
export function median(values: number[]): number {
  if (values.length % 2 !== 1) throw new Error(`median of ${values.length} values is ambiguous`);
  return [...values].sort((a, b) => a - b)[(values.length - 1) / 2]!;
}

export function summarize(runs: Timing[]): Summary {
  const wall = runs.map(r => r.real);
  return {
    runs: runs.length,
    median: median(wall),
    min: Math.min(...wall),
    max: Math.max(...wall),
    cpu: median(runs.map(r => r.user + r.sys)),
    rssMiB: median(runs.map(r => r.maxrss / 2 ** 20)),
  };
}

/**
 * One pass over many configs as a single timing: wall and CPU times add up, since
 * the configs are checked one after another, and peak memory is the largest peak.
 */
export function combine(runs: Timing[]): Timing {
  return {
    real: runs.reduce((s, r) => s + r.real, 0),
    user: runs.reduce((s, r) => s + r.user, 0),
    sys: runs.reduce((s, r) => s + r.sys, 0),
    maxrss: Math.max(0, ...runs.map(r => r.maxrss)),
  };
}

/** The list started k places along, wrapping: rotate([a, b, c], 1) is [b, c, a]. */
export const rotate = <T>(xs: T[], k: number): T[] => xs.map((_, i) => xs[(i + k) % xs.length]!);

/** How many times faster than the reference: reference median / checker median. */
export const speedup = (reference: number, value: number): number => reference / value;

/** The fields `/usr/bin/time -l` (macOS) prints to stderr. */
export function parseMacTime(stderr: string): Timing {
  const times = / *([\d.]+) real +([\d.]+) user +([\d.]+) sys/.exec(stderr);
  const rss = /(\d+) +maximum resident set size/.exec(stderr);
  if (!times || !rss) throw new Error('could not parse /usr/bin/time -l output');
  return { real: Number(times[1]), user: Number(times[2]), sys: Number(times[3]), maxrss: Number(rss[1]) };
}

/** GNU time with -f "%e %U %S %M %x": the last line; %M is in KiB. */
export function parseGnuTime(text: string): Measured {
  const [real, user, sys, kib, exit] = text.trim().split('\n').at(-1)!.split(' ').map(Number);
  return { real: real!, user: user!, sys: sys!, maxrss: kib! * 1024, exit: exit! };
}
