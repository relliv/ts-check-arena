import { describe, expect, it } from 'vitest';
import { combine, median, parseGnuTime, parseMacTime, rotate, summarize } from '../src/lib/stats.ts';

describe('median', () => {
  it('takes the middle of an odd-length list', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('refuses an even-length list rather than pick a convention', () => {
    expect(() => median([1, 2])).toThrow(/ambiguous/);
  });
});

describe('summarize', () => {
  it('reports wall median, min and max, CPU median and peak memory in MiB', () => {
    const runs = [
      { real: 1, user: 2, sys: 1, maxrss: 2 ** 20 },
      { real: 3, user: 4, sys: 1, maxrss: 3 * 2 ** 20 },
      { real: 2, user: 3, sys: 1, maxrss: 2 * 2 ** 20 },
    ];
    expect(summarize(runs)).toEqual({ runs: 3, median: 2, min: 1, max: 3, cpu: 4, rssMiB: 2 });
  });
});

describe('combine', () => {
  it('adds times over a pass and keeps the largest peak', () => {
    expect(
      combine([
        { real: 1, user: 1, sys: 0.5, maxrss: 10 },
        { real: 2, user: 3, sys: 0.5, maxrss: 30 },
      ])
    ).toEqual({ real: 3, user: 4, sys: 1, maxrss: 30 });
  });
});

describe('rotate', () => {
  it('starts k places along and wraps', () => {
    expect(rotate(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a']);
    expect(rotate(['a', 'b', 'c'], 3)).toEqual(['a', 'b', 'c']);
  });
});

describe('time parsers', () => {
  it('reads /usr/bin/time -l output', () => {
    const text = '        1.23 real         2.50 user         0.40 sys\n  123456789  maximum resident set size\n';
    expect(parseMacTime(text)).toEqual({ real: 1.23, user: 2.5, sys: 0.4, maxrss: 123456789 });
  });

  it('reads GNU time output, with memory in KiB', () => {
    expect(parseGnuTime('Command exited with non-zero status 2\n0.50 1.00 0.20 2048 2\n')).toEqual({
      real: 0.5,
      user: 1,
      sys: 0.2,
      maxrss: 2048 * 1024,
      exit: 2,
    });
  });
});
