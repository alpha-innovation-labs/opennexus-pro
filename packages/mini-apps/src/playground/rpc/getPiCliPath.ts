import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";

/**
 * Resolves the installed Pi CLI entrypoint for the RPC child process.
 *
 * @returns Absolute Pi CLI path.
 */
export function getPiCliPath(): string {
	const piPath = execFileSync("which", ["pi"], { encoding: "utf8" }).trim();
	return realpathSync(piPath);
}
