import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Runs the macOS security CLI with stdout and stderr captured.
 *
 * @param args Arguments passed to the security executable.
 * @returns Captured stdout text.
 */
export async function runSecurityCommand(args: string[]): Promise<string> {
	const result = await execFileAsync("security", args, { encoding: "utf8" });
	return result.stdout;
}
