import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { addPnpmException } from '../src/lib/store.ts';
import { ShadowStore, shadowOverrides } from '../src/lib/shadow.ts';

let dir: string;

function project(config: object): string {
  dir = mkdtempSync(join(tmpdir(), 'arena-shadow-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src', 'index.ts'), 'export const x = 1;\n');
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(config));
  return join(dir, 'tsconfig.json');
}

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('shadowOverrides', () => {
  it('needs nothing for a config TypeScript 7 reads as is', () => {
    const config = project({ compilerOptions: { module: 'esnext', moduleResolution: 'bundler', strict: true }, include: ['src'] });
    expect(shadowOverrides(config, dir)).toEqual({});
  });

  it('unsets the options TypeScript 7 removed and makes paths absolute', () => {
    const config = project({
      compilerOptions: { baseUrl: '.', moduleResolution: 'node', module: 'commonjs', esModuleInterop: false, paths: { '@x/*': ['src/*'] } },
      include: ['src'],
    });
    const overrides = shadowOverrides(config, dir);
    expect(overrides).toMatchObject({ baseUrl: null, esModuleInterop: null, moduleResolution: 'bundler', module: 'esnext' });
    expect((overrides['paths'] as Record<string, string[]>)['@x/*']![0]).toBe(join(dir, 'src/*'));
  });

  it('throws when TypeScript 6 itself rejects the config', () => {
    const config = project({ extends: './missing.json', include: ['src'] });
    expect(() => shadowOverrides(config, dir)).toThrow();
  });
});

describe('ShadowStore', () => {
  it('writes a self-ignoring folder inside the target and removes it', () => {
    project({ compilerOptions: { baseUrl: '.' }, include: ['src'] });
    const store = new ShadowStore(dir);
    const checked = store.prepare('tsconfig.json', 'auto');
    expect(checked.path.startsWith(join(dir, '.ts-check-arena'))).toBe(true);
    expect(readFileSync(join(dir, '.ts-check-arena', '.gitignore'), 'utf8')).toBe('*\n');
    store.cleanup();
    expect(existsSync(join(dir, '.ts-check-arena'))).toBe(false);
  });

  it('checks the config itself when no override is needed or shadows are off', () => {
    project({ compilerOptions: { baseUrl: '.' }, include: ['src'] });
    expect(new ShadowStore(dir).prepare('tsconfig.json', 'never')).toEqual({ config: 'tsconfig.json', path: join(dir, 'tsconfig.json'), overrides: null });
  });
});

describe('addPnpmException', () => {
  it('creates the list after its anchor, then appends without duplicates', () => {
    project({});
    const file = join(dir, 'pnpm-workspace.yaml');
    writeFileSync(file, 'packages:\n  - tools/*\nminimumReleaseAge: 10080\ntrustPolicyIgnoreAfter: 1\n');
    expect(addPnpmException('minimumReleaseAgeExclude', 'typescript@7.1.0-dev.1', file)).toBe(true);
    expect(addPnpmException('minimumReleaseAgeExclude', 'typescript@7.1.0-dev.1', file)).toBe(false);
    addPnpmException('trustPolicyExclude', 'tsrs@0.20.0', file);
    expect(readFileSync(file, 'utf8')).toBe(
      'packages:\n  - tools/*\nminimumReleaseAge: 10080\nminimumReleaseAgeExclude:\n  - typescript@7.1.0-dev.1\ntrustPolicyIgnoreAfter: 1\ntrustPolicyExclude:\n  - tsrs@0.20.0\n'
    );
  });
});
