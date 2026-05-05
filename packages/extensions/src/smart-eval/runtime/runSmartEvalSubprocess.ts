import { spawn } from "node:child_process";
import { appendNoExtensionsArg } from "@nexus/app-tui/cli/extensions/appendNoExtensionsArg.js";
import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";

export interface SmartEvalSubprocessResult {
	code: number | null;
	stdout: string;
	stderr: string;
}

/**
 * Runs the current Nexus CLI as an isolated smart-eval subprocess.
 *
 * @param args CLI arguments.
 * @param cwd Working directory.
 * @returns Captured subprocess result.
 */
export async function runSmartEvalSubprocess(args: string[], cwd: string): Promise<SmartEvalSubprocessResult> {
	return new Promise((resolve, reject) => {
		const launchSpec = getCurrentNexusLaunchSpec(appendNoExtensionsArg(args));
		const child = spawn(launchSpec.command, launchSpec.args, {
			cwd,
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk: Buffer | string) => {
			stdout += chunk.toString();
		});
		child.stderr.on("data", (chunk: Buffer | string) => {
			stderr += chunk.toString();
		});
		child.on("error", reject);
		child.on("close", (code) => resolve({ code, stdout, stderr }));
	});
}
