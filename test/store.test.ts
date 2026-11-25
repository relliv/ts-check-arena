import { describe, expect, it } from 'vitest';
import { parseTool } from '../src/lib/checkers.ts';
import { KEEP_VERSIONS, toPrune } from '../src/lib/store.ts';

const ids = (list: { id: string }[]) => list.map(t => t.id);

describe('toPrune', () => {
  it('keeps the newest versions of each family and names the rest, oldest first', () => {
    const tools = ['tsc-rs@0.5.0', 'tsc-rs@0.8.0', 'tsc-rs@0.6.0', 'tsc-rs@0.7.0', 'tsc-rs@0.4.0'].map(parseTool);
    expect(KEEP_VERSIONS).toBe(3);
    expect(ids(toPrune(tools))).toEqual(['tsc-rs@0.4.0', 'tsc-rs@0.5.0']);
  });

  it('orders by version, not by name, across a version scheme change', () => {
    const tools = ['tsrs@0.20.1-ts7.1.0-beta', 'tsrs@7.1.0-beta.tsrs3', 'tsrs@0.25.0-ts7.1.0-beta', 'tsrs@0.18.0-ts7.1.0-dev.20260929'].map(parseTool);
    expect(ids(toPrune(tools))).toEqual(['tsrs@0.18.0-ts7.1.0-dev.20260929']);
  });

  it('applies a family keep count: tsc keeps one', () => {
    const tools = ['tsc@5.9.3', 'tsc@6.0.3', 'tsc@6.0.2'].map(parseTool);
    expect(ids(toPrune(tools))).toEqual(['tsc@5.9.3', 'tsc@6.0.2']);
  });

  it('never removes the newest tsgo, the default reference', () => {
    const tools = ['tsgo@7.0.2', 'tsgo@7.0.10', 'tsgo@7.1.0-beta', 'tsgo@7.1.0'].map(parseTool);
    expect(ids(toPrune(tools))).toEqual(['tsgo@7.0.2']);
  });

  it('leaves families at or under their count alone', () => {
    expect(toPrune(['bun@1.4.3', 'tsgo@7.0.2', 'tsgo@7.1.0-beta'].map(parseTool))).toEqual([]);
  });
});
