import { describe, expect, it } from 'vitest';
import { compareOutputs, maskElapsed, normalizeDiagnostics } from '../src/lib/diagnostics.ts';

const TSC = [
  "src/b.ts(3,5): error TS2322: Type 'string' is not assignable to type 'number'.",
  '  Elaboration that is dropped.',
  "src/a.ts(1,1): error TS2304: Cannot find name 'x'.",
  '',
  'Found 2 errors in 2 files.',
].join('\n');

describe('normalizeDiagnostics', () => {
  it('keeps one sorted line per diagnostic and drops elaboration and summaries', () => {
    expect(normalizeDiagnostics(TSC)).toEqual([
      "src/a.ts:1:1 TS2304 Cannot find name 'x'.",
      "src/b.ts:3:5 TS2322 Type 'string' is not assignable to type 'number'.",
    ]);
  });

  it('turns Windows separators into slashes', () => {
    expect(normalizeDiagnostics('src\\a.ts(1,1): error TS1: m')).toEqual(['src/a.ts:1:1 TS1 m']);
  });

  it('keeps diagnostics without a location', () => {
    expect(normalizeDiagnostics("error TS5102: Option 'baseUrl' has been removed.")).toEqual([
      "- TS5102 Option 'baseUrl' has been removed.",
    ]);
  });
});

describe('maskElapsed', () => {
  it("hides bun's printed elapsed time", () => {
    expect(maskElapsed('No type errors [46.52ms] then [2.40s]')).toBe('No type errors [time] then [time]');
  });
});

describe('compareOutputs', () => {
  it('reports identical output', () => {
    expect(compareOutputs({ text: TSC, exit: 2 }, { text: TSC }).parity).toBe('identical');
  });

  it('reports the same diagnostics in another format as same-normalized', () => {
    const reordered = TSC.split('\n').reverse().join('\n');
    expect(compareOutputs({ text: reordered, exit: 2 }, { text: TSC }).parity).toBe('same-normalized');
  });

  it('lists extra and missing diagnostics', () => {
    const result = compareOutputs({ text: 'src/c.ts(9,9): error TS1: new', exit: 2 }, { text: TSC });
    expect(result.parity).toBe('differs');
    expect(result.extra).toEqual(['src/c.ts:9:9 TS1 new']);
    expect(result.missing).toHaveLength(2);
  });

  it('calls a non-zero exit without diagnostics a failure, not a clean check', () => {
    expect(compareOutputs({ text: 'error: Unknown flag "--no-script"', exit: 1 }, { text: '' }).parity).toBe('failed');
  });
});
