// Comparing what checkers report. Covered by test/diagnostics.test.ts.

// A tsc-style one-line diagnostic: path(line,col): error TSnnnn: message
const DIAGNOSTIC = /^([^ (][^(]*)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
// A diagnostic without a location, such as a config error: error TSnnnn: message
const GLOBAL = /^error (TS\d+): (.*)$/;

/**
 * Reduces checker output to its diagnostics, one "path:line:col TSnnnn message" line
 * each, sorted. Elaboration lines and summaries are dropped, so two outputs that
 * normalize to the same lines report the same errors, at the same places, with the
 * same top-level messages. Backslashes in paths become "/".
 */
export function normalizeDiagnostics(text: string): string[] {
  const lines: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = DIAGNOSTIC.exec(line);
    if (m) {
      lines.push(`${m[1]!.replaceAll('\\', '/')}:${m[2]}:${m[3]} ${m[4]} ${m[5]}`);
      continue;
    }
    const g = GLOBAL.exec(line);
    if (g) lines.push(`- ${g[1]} ${g[2]}`);
  }
  return lines.sort();
}

/** Lines only in a, and only in b. */
export function lineDiff(a: string[], b: string[]): { onlyA: string[]; onlyB: string[] } {
  const inA = new Set(a);
  const inB = new Set(b);
  return { onlyA: a.filter(l => !inB.has(l)), onlyB: b.filter(l => !inA.has(l)) };
}

/** bun prints elapsed time, such as "[2.40s]" or "[1398.09ms]"; masked when comparing. */
export const maskElapsed = (text: string): string => text.replace(/\[[\d.,]+m?s\]/g, '[time]');

export type Parity = 'identical' | 'same-normalized' | 'differs' | 'failed';

export interface ParityResult {
  parity: Parity;
  errors: number;
  /** Diagnostics only this checker reported. */
  extra: string[];
  /** Diagnostics only the reference reported. */
  missing: string[];
}

/**
 * Compares one checker's output with the reference's. `failed` means it exited
 * non-zero without reporting any diagnostic: a crash, a kill or an unreadable config.
 */
export function compareOutputs(
  output: { text: string; exit: number },
  reference: { text: string }
): ParityResult {
  const mine = normalizeDiagnostics(output.text);
  const theirs = normalizeDiagnostics(reference.text);
  const { onlyA: extra, onlyB: missing } = lineDiff(mine, theirs);
  if (output.exit !== 0 && mine.length === 0) return { parity: 'failed', errors: 0, extra, missing };
  const parity: Parity =
    maskElapsed(output.text) === maskElapsed(reference.text)
      ? 'identical'
      : extra.length === 0 && missing.length === 0
        ? 'same-normalized'
        : 'differs';
  return { parity, errors: mine.length, extra, missing };
}
