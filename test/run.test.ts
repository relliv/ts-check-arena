import { describe, expect, it } from 'vitest';
import { runId } from '../src/lib/run.ts';

const base = { cpu: 'Cobalt 100', platform: 'win32', act: false, label: 'vite', smoke: false };

describe('runId', () => {
  it('names the day, the UTC start time, the CPU, the platform and the project', () => {
    expect(runId({ ...base, now: new Date('2026-11-25T13:03:47Z') })).toBe('2026-11-25-1303-cobalt-100-win32-vite');
  });

  it('keeps two runs of one day on one runner apart', () => {
    const morning = runId({ ...base, now: new Date('2026-11-25T09:53:12Z') });
    const afternoon = runId({ ...base, now: new Date('2026-11-25T13:03:47Z') });
    expect(morning).not.toBe(afternoon);
  });

  it('marks an act run, so it never takes the id of the CI run it imitates', () => {
    const now = new Date('2026-11-25T12:23:00Z');
    expect(runId({ ...base, now, platform: 'linux', cpu: 'unknown', act: true })).toBe('2026-11-25-1223-unknown-linux-act-vite');
    expect(runId({ ...base, now, platform: 'linux', cpu: 'unknown' })).toBe('2026-11-25-1223-unknown-linux-vite');
  });

  it('keeps the seconds for smoke runs, which are throwaway', () => {
    expect(runId({ ...base, now: new Date('2026-11-25T13:03:47Z'), smoke: true })).toBe('2026-11-25T130347-vite');
  });
});
