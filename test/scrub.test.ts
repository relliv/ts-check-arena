import { describe, expect, it } from 'vitest';
import { scrubber } from '../src/lib/scrub.ts';

describe('scrubber', () => {
  const scrub = scrubber({ '<target>': '/work/projects/app', '<arena>': '/work/arena' }, 'someone', '/home/someone');

  it('replaces the target, the arena and the home directory', () => {
    expect(scrub('/work/projects/app/src/a.ts(1,1): error')).toBe('<target>/src/a.ts(1,1): error');
    expect(scrub('/work/arena/tools/tsgo@7.0.2')).toBe('<arena>/tools/tsgo@7.0.2');
    expect(scrub('/home/someone/.cache/x')).toBe('~/.cache/x');
  });

  it('prefers the longest base, so a nested folder is not named by its parent', () => {
    const nested = scrubber({ '<outer>': '/a', '<inner>': '/a/b' }, '', '/nowhere');
    expect(nested('/a/b/c and /a/c')).toBe('<inner>/c and <outer>/c');
  });

  it('matches Windows separators', () => {
    const win = scrubber({ '<target>': 'C:/work/app' }, '', 'C:/Users/x');
    expect(win('C:\\work\\app\\src\\a.ts')).toBe('<target>\\src\\a.ts');
  });

  it('removes the user name wherever it appears', () => {
    expect(scrub('owner someone ran this')).toBe('owner <user> ran this');
  });
});
