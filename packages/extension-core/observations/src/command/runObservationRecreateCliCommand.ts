import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getCurrentNexusLaunchSpec } from "@nexus/runtime";
import type { ObservationRecreateCliResult } from "./types/ObservationRecreateCliResult";

const execFileAsync = promisify(execFile);

/**
 * Runs the same CLI path as `nexus observations recreate` for one target.
 *
 * @param target Session target passed to the observations recreate command.
 * @param cwd Working directory for the nested Nexus process.
 * @returns Captured CLI completion details.
 */
export async function runObservationRecreateCliCommand(
	target: string,
	cwd: string,
): Promise<ObservationRecreateCliResult> {
	const launchSpec = getCurrentNexusLaunchSpec([
		"observations",
		"recreate",
		target,
	]);
	try {
		const { stdout, stderr } = await execFileAsync(
			launchSpec.command,
			launchSpec.args,
			{
				cwd,
				env: process.env,
				maxBuffer: 10 * 1024 * 1024,
			},
		);
		return { exitCode: 0, stdout, stderr };
	} catch (error) {
		const failure = error as Error & {
			code?: number | string;
			stdout?: string | Buffer;
			stderr?: string | Buffer;
		};
		return {
			exitCode: typeof failure.code === "number" ? failure.code : 1,
			stdout: String(failure.stdout ?? ""),
			stderr: String(failure.stderr ?? failure.message),
		};
	}
}
