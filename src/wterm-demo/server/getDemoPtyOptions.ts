export interface DemoPtyOptions {
  name: string;
  cols: number;
  rows: number;
  cwd: string;
  env: Record<string, string | undefined>;
}

/**
 * Returns the PTY options used by the browser demo process.
 */
export function getDemoPtyOptions(): DemoPtyOptions {
  return {
    name: "xterm-256color",
    cols: 120,
    rows: 32,
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      FORCE_COLOR: "1",
    },
  };
}
