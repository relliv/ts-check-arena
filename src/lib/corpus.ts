// Pinned public projects (corpus.json), cloned into corpus/<name>/ at a fixed commit.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { CORPUS_DIR, FIXTURES_DIR, ROOT } from './paths.ts';

type Step = { run: string[] } | { copy: [string, string] };

export interface CorpusProject {
  name: string;
  description: string;
  repo: string;
  sha: string;
  install: Step[];
  configs: string[];
  source: string;
}

export const corpus: CorpusProject[] = (
  JSON.parse(readFileSync(join(ROOT, 'corpus.json'), 'utf8')) as { projects: CorpusProject[] }
).projects;

export function corpusProject(name: string): CorpusProject {
  const found = corpus.find(p => p.name === name);
  if (!found) throw new Error(`unknown corpus project "${name}"; known: ${corpus.map(p => p.name).join(', ')}`);
  return found;
}

function exec(argv: string[], cwd: string): void {
  const [file, ...args] = argv;
  const r = spawnSync(file!, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`${argv.join(' ')} failed in ${cwd} (exit ${r.status})`);
}

/** Clones each project at its pinned commit and runs its install steps. */
export function setupCorpus(name?: string): void {
  mkdirSync(CORPUS_DIR, { recursive: true });
  for (const project of name ? [corpusProject(name)] : corpus) {
    const dir = join(CORPUS_DIR, project.name);
    if (!existsSync(dir)) {
      exec(['git', 'init', '-q', dir], ROOT);
      exec(['git', 'remote', 'add', 'origin', project.repo], dir);
    }
    exec(['git', 'fetch', '-q', '--depth', '1', 'origin', project.sha], dir);
    exec(['git', 'checkout', '-q', '--force', project.sha], dir);
    for (const step of project.install) {
      if ('copy' in step) {
        const [from, to] = step.copy.map(p => p.replace('{fixtures}', join(FIXTURES_DIR, 'corpus')));
        copyFileSync(isAbsolute(from!) ? from! : join(dir, from!), join(dir, to!));
      } else {
        exec(step.run, dir);
      }
    }
    console.log(`${project.name}: ready at ${project.sha.slice(0, 12)}`);
  }
}
