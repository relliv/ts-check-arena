// What a run records about where it ran, and the conditions it refuses or warns
// about. Nothing identifying is recorded: no host name, user name or serial number.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';

const output = (program: string, args: string[]): string => {
  const r = spawnSync(program, args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
};

export interface Machine {
  platform: string;
  cpu: string;
  cores: number;
  memoryGiB: number;
  os: string;
  node: string;
}

export interface Source {
  kind: 'local' | 'ci';
  /** CI only: the runner label and image, and the workflow run. */
  runner?: string;
  image?: string;
  runUrl?: string;
  commit?: string;
}

export function cpuModel(): string {
  const model = os.cpus()[0]?.model?.trim();
  if (model && model !== 'unknown') return model;
  if (process.platform === 'linux') {
    const fields = Object.fromEntries(
      output('lscpu', []).split('\n').map(l => l.split(/:\s+/, 2).map(x => x.trim()) as [string, string])
    );
    const name = [fields['Vendor ID'], fields['Model name']].filter(x => x && x !== '-').join(' ');
    if (name) return name;
  }
  return os.machine();
}

export function osName(): string {
  if (process.platform === 'darwin') return `macOS ${output('sw_vers', ['-productVersion'])} (${output('sw_vers', ['-buildVersion'])})`;
  if (process.platform === 'linux') {
    const release = existsSync('/etc/os-release')
      ? /^PRETTY_NAME="?([^"\n]*)"?/m.exec(readFileSync('/etc/os-release', 'utf8'))?.[1]
      : undefined;
    return `${release ?? 'Linux'} (${os.release()})`;
  }
  return `${os.version()} (${os.release()})`;
}

export function machine(): Machine {
  return {
    platform: `${process.platform}-${process.arch}`,
    cpu: cpuModel(),
    cores: os.availableParallelism(),
    memoryGiB: Math.round(os.totalmem() / 2 ** 30),
    os: osName(),
    node: process.version,
  };
}

/** GitHub Actions sets these; anything else counts as a local run. */
export function source(env = process.env): Source {
  if (env['GITHUB_ACTIONS'] !== 'true') return { kind: 'local' };
  return {
    kind: 'ci',
    runner: env['ARENA_RUNNER_LABEL'] ?? `${env['RUNNER_OS']}-${env['RUNNER_ARCH']}`,
    image: env['ImageOS'] && env['ImageVersion'] ? `${env['ImageOS']} ${env['ImageVersion']}` : undefined,
    runUrl: env['GITHUB_RUN_ID'] ? `${env['GITHUB_SERVER_URL']}/${env['GITHUB_REPOSITORY']}/actions/runs/${env['GITHUB_RUN_ID']}` : undefined,
    commit: env['GITHUB_SHA'],
  };
}

/** Power source. A machine without a battery, such as a CI runner, counts as AC. */
export function onAC(): boolean {
  if (process.platform === 'darwin') {
    const batt = output('pmset', ['-g', 'batt']);
    return batt === '' || batt.includes('AC Power');
  }
  if (process.platform === 'linux') {
    const dir = '/sys/class/power_supply';
    if (!existsSync(dir)) return true;
    const read = (d: string, f: string) => (existsSync(join(dir, d, f)) ? readFileSync(join(dir, d, f), 'utf8').trim() : '');
    const supplies = readdirSync(dir);
    const batteries = supplies.filter(d => read(d, 'type') === 'Battery');
    if (batteries.length === 0) return true;
    return supplies.some(d => read(d, 'type') === 'Mains' && read(d, 'online') === '1');
  }
  return true;
}

/** Whether this Node runs translated by Rosetta, which would time the x64 builds. */
export function underRosetta(): boolean {
  if (process.platform !== 'darwin') return false;
  return output('/usr/sbin/sysctl', ['-in', 'sysctl.proc_translated']) === '1';
}

/** Keeps the machine awake until the returned function is called. */
export function holdAwake(): () => void {
  let helper: ReturnType<typeof spawn> | null = null;
  if (process.platform === 'darwin') {
    helper = spawn('caffeinate', ['-dis', '-w', String(process.pid)], { stdio: 'ignore' });
  } else if (process.platform === 'win32') {
    const script =
      "Add-Type -Name P -Namespace W -MemberDefinition '[DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f);'; [W.P]::SetThreadExecutionState(0x80000003) | Out-Null; [Console]::In.ReadLine() | Out-Null";
    helper = spawn('powershell', ['-NoProfile', '-Command', script], { stdio: ['pipe', 'ignore', 'ignore'] });
  }
  helper?.on('error', () => {});
  return () => {
    helper?.stdin?.end();
    helper?.kill();
  };
}

/** Conditions worth recording: load, busy processes, a CPU speed limit. */
export function warnings(): string[] {
  const found: string[] = [];
  const [load1] = os.loadavg();
  if (load1 !== undefined && load1 > os.availableParallelism() / 2) {
    found.push(`load average ${load1.toFixed(2)} on ${os.availableParallelism()} cores`);
  }
  if (process.platform === 'darwin') {
    const m = /CPU_Speed_Limit\s*=\s*(\d+)/.exec(output('pmset', ['-g', 'therm']));
    if (m && Number(m[1]) < 100) found.push(`CPU speed limited to ${m[1]}%`);
  }
  if (process.platform !== 'win32') {
    for (const line of output('ps', ['-Ao', 'pcpu=,comm=']).split('\n')) {
      const m = /^\s*([\d.]+)\s+(.*)$/.exec(line);
      if (m && Number(m[1]) >= 25 && !/kernel_task|WindowServer|\bps$|node$/.test(m[2]!)) {
        found.push(`busy process: ${m[2]!.split('/').at(-1)} at ${m[1]}% CPU`);
      }
    }
  }
  return found;
}
