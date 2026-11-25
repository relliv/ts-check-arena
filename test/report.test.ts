import { describe, expect, it } from 'vitest';
import type { CorpusProject } from '../src/lib/corpus.ts';
import { projectOf } from '../src/lib/report.ts';

const vite = { name: 'vite', repo: 'https://github.com/vitejs/vite', sha: 'pinned', description: 'Frontend tooling monorepo' } as CorpusProject;
const target = (kind: 'corpus' | 'path', commit: string | null, dirty: boolean | null) => ({ kind, discovery: 'list' as const, commit, dirty });

describe('projectOf', () => {
  it('names the repository and the commit that was actually checked', () => {
    expect(projectOf({ label: 'vite', target: target('corpus', 'cce559ab', false) }, [vite])).toEqual({
      repo: 'https://github.com/vitejs/vite',
      commit: 'cce559ab',
      description: 'Frontend tooling monorepo',
    });
  });

  it('leaves out runs against a path, which may be private', () => {
    expect(projectOf({ label: 'vite', target: target('path', 'cce559ab', false) }, [vite])).toBeUndefined();
  });

  it('leaves out a checkout with no commit or local changes, since the link would not show what was checked', () => {
    expect(projectOf({ label: 'vite', target: target('corpus', null, null) }, [vite])).toBeUndefined();
    expect(projectOf({ label: 'vite', target: target('corpus', 'cce559ab', true) }, [vite])).toBeUndefined();
  });

  it('leaves out a label that is not a corpus project', () => {
    expect(projectOf({ label: 'other', target: target('corpus', 'cce559ab', false) }, [vite])).toBeUndefined();
  });
});
