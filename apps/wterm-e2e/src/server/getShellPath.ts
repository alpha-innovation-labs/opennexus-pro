import { platform } from "node:os";

/**
 * Picks the shell executable used by the browser-hosted PTY.
 */
export function getShellPath(): string {
  return process.env.SHELL ?? (platform() === "win32" ? "cmd.exe" : "/bin/bash");
}
