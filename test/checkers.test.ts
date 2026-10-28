import { describe, expect, it } from 'vitest';
import { binarySpec, command, compareVersions, defaultThreads, familyArgs, inRange, parseTool, threadArgs, toolDir, variantIds } from '../src/lib/checkers.ts';

describe('inRange', () => {
  it('compares only the numeric prefix, so prereleases fall in their major', () => {
    expect(inRange('7.1.0-dev.20261008.1', '>=7')).toBe(true);
    expect(inRange('6.0.3', '<7')).toBe(true);
    expect(inRange('7.0.2', '<7')).toBe(false);
    expect(inRange('1.4.3', '>=1.4.3')).toBe(true);
    expect(inRange('1.4.2', '>=1.4.3')).toBe(false);
    expect(inRange('0.0.1', '*')).toBe(true);
  });
});

describe('compareVersions', () => {
  it('orders by semver precedence', () => {
    const sorted = ['7.1.0', '7.1.0-dev.20261027.1', '7.0.2', '7.1.0-beta', '7.1.0-dev.20261008.1', '7.0.10'].sort(compareVersions);
    expect(sorted).toEqual(['7.0.2', '7.0.10', '7.1.0-beta', '7.1.0-dev.20261008.1', '7.1.0-dev.20261027.1', '7.1.0']);
  });
});

describe('parseTool', () => {
  it('reads family@version', () => {
    const tool = parseTool('tsgo@7.0.2');
    expect(tool.family.name).toBe('tsgo');
    expect(tool.version).toBe('7.0.2');
  });

  it('puts TypeScript 6 and 7 in different families', () => {
    expect(() => parseTool('tsgo@6.0.3')).toThrow(/outside the tsgo family/);
    expect(() => parseTool('tsc@7.0.2')).toThrow(/outside the tsc family/);
  });

  it('wants an exact version', () => {
    expect(() => parseTool('tsgo@latest')).toThrow(/exact version/);
    expect(() => parseTool('tsgo')).toThrow(/family@version/);
    expect(() => parseTool('nope@1.0.0')).toThrow(/unknown checker family/);
  });
});

describe('variants', () => {
  it('parses family@version+variant and shares the installed package', () => {
    const fast = parseTool('tsrs@0.20.1-ts7.1.0-beta+fast');
    expect(fast).toMatchObject({ id: 'tsrs@0.20.1-ts7.1.0-beta+fast', base: 'tsrs@0.20.1-ts7.1.0-beta', variant: 'fast', version: '0.20.1-ts7.1.0-beta' });
    expect(toolDir(fast)).toBe(toolDir(parseTool('tsrs@0.20.1-ts7.1.0-beta')));
  });

  it('applies a variant only where its version range allows', () => {
    expect(() => parseTool('tsrs@0.18.0-ts7.1.0-dev.20260929+fast')).toThrow(/needs tsrs >=0.20/);
    expect(() => parseTool('tsgo@7.0.2+fast')).toThrow(/no variant "fast"/);
    expect(variantIds(parseTool('tsrs@0.20.1-ts7.1.0-beta'))).toEqual(['tsrs@0.20.1-ts7.1.0-beta+fast']);
    expect(variantIds(parseTool('tsrs@0.18.0-ts7.1.0-dev.20260929'))).toEqual([]);
  });

  it('adds the variant arguments to the command', () => {
    const argv = command(parseTool('tsrs@0.20.1-ts7.1.0-beta+fast'), 'tsconfig.json');
    expect(argv).toContain('--fast');
  });
});

describe('defaultThreads', () => {
  it('follows the release that changed it', () => {
    expect(defaultThreads(parseTool('tsrs@0.18.0-ts7.1.0-dev.20260929'))).toBe('per-core');
    expect(defaultThreads(parseTool('tsrs@0.20.1-ts7.1.0-beta'))).toBe(4);
    expect(defaultThreads(parseTool('tsgo@7.0.2'))).toBe(4);
  });
});

describe('platforms', () => {
  it('knows where a checker publishes no build', () => {
    expect(binarySpec(parseTool('tsrs@0.18.0-ts7.1.0-dev.20260929'), 'win32-x64')).toBeNull();
    expect(binarySpec(parseTool('tsgo@7.0.2'), 'win32-x64')?.file).toBe('lib/tsc.exe');
  });

  it('adds a platform only from the version that first publishes it', () => {
    expect(binarySpec(parseTool('tsrs@0.20.1-ts7.1.0-beta'), 'win32-x64')?.file).toBe('tsrs.exe');
    expect(binarySpec(parseTool('tsrs@0.20.1-ts7.1.0-beta'), 'darwin-x64')?.file).toBe('tsrs');
    expect(binarySpec(parseTool('tsrs@0.18.0-ts7.1.0-dev.20260929'), 'darwin-x64')).toBeNull();
  });

  it('runs the JavaScript tsc everywhere', () => {
    expect(binarySpec(parseTool('tsc@6.0.3'), 'freebsd-x64')?.file).toBe('lib/tsc.js');
  });
});

describe('arguments', () => {
  it('applies version-scoped family arguments only in range', () => {
    expect(familyArgs(parseTool('bun@1.4.3'))).toEqual(['check']);
    expect(familyArgs(parseTool('bun@1.4.4'))).toEqual(['check', '--no-script']);
  });

  it('uses each checker’s documented thread flags', () => {
    expect(threadArgs(parseTool('tsgo@7.0.2'), 1)).toEqual(['--singleThreaded']);
    expect(threadArgs(parseTool('tsgo@7.0.2'), 4)).toEqual(['--checkers', '4']);
    expect(threadArgs(parseTool('bun@1.4.3'), 4)).toEqual(['--threads=4']);
    expect(threadArgs(parseTool('tsc@6.0.3'), 4)).toBeNull();
    expect(threadArgs(parseTool('tsc@6.0.3'), 'default')).toEqual([]);
  });
});
