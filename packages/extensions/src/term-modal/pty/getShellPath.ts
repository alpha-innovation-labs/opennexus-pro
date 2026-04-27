import { platform } from "node:os";

/**
 * Picks the shell binary that the PTY should launch.
 *
 * @returns Shell executable path.
 */
export function getShellPath(): string {
	return process.env.SHELL ?? (platform() === "win32" ? "cmd.exe" : "/bin/bash");
}
