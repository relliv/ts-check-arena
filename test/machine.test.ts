import { describe, expect, it } from 'vitest';
import { source } from '../src/lib/machine.ts';

describe('source', () => {
  it('is local without GitHub Actions variables', () => {
    expect(source({})).toEqual({ kind: 'local' });
  });

  it('is CI on a GitHub runner, with its label and run link', () => {
    const s = source({ GITHUB_ACTIONS: 'true', ARENA_RUNNER_LABEL: 'ubuntu-24.04', GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: 'o/r', GITHUB_RUN_ID: '42' });
    expect(s.kind).toBe('ci');
    expect(s.runner).toBe('ubuntu-24.04');
    expect(s.runUrl).toBe('https://github.com/o/r/actions/runs/42');
  });

  it('is act, not CI, when act replays the workflow, even though it sets GITHUB_ACTIONS', () => {
    expect(source({ ACT: 'true', GITHUB_ACTIONS: 'true', ARENA_RUNNER_LABEL: 'ubuntu-24.04' })).toEqual({ kind: 'act', runner: 'ubuntu-24.04' });
  });
});
