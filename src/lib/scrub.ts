// Recorded output must not reveal the machine it ran on: absolute paths, the home
// directory and the user name are replaced before anything is written to results.
import { realpathSync } from 'node:fs';
import { homedir, userInfo } from 'node:os';

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Both spellings of a directory: as given and with symlinks resolved (/tmp is /private/tmp). */
function variants(dir: string): string[] {
  let real = dir;
  try {
    real = realpathSync(dir);
  } catch {
    // A directory that does not exist yet is only replaced as given.
  }
  return [...new Set([real, dir])];
}

export interface Scrubber {
  (text: string): string;
}

/**
 * Builds a scrubber for these bases, longest first so a nested base wins over its
 * parent. Paths are matched with either separator, so Windows output is covered.
 */
export function scrubber(bases: Record<string, string>, user = safeUser(), home = homedir()): Scrubber {
  const pairs: [RegExp, string][] = [];
  const all = Object.entries({ ...bases, '~': home }).flatMap(([label, dir]) => variants(dir).map(d => [d, label] as const));
  all.sort((a, b) => b[0].length - a[0].length);
  for (const [dir, label] of all) {
    if (!dir) continue;
    const pattern = escape(dir.replaceAll('\\', '/')).replaceAll('/', '[\\\\/]');
    pairs.push([new RegExp(pattern, 'gi'), label]);
  }
  if (user && user.length > 2) pairs.push([new RegExp(`\\b${escape(user)}\\b`, 'g'), '<user>']);
  return text => pairs.reduce((t, [re, label]) => t.replace(re, label), text);
}

function safeUser(): string {
  try {
    return userInfo().username;
  } catch {
    return '';
  }
}
