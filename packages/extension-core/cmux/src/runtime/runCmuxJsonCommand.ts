import { spawn } from "node:child_process";
import { getCmuxExecutablePath } from "./getCmuxExecutablePath";

const CMUX_COMMAND_TIMEOUT_MS = 5000;

/**
 * Executes cmux with JSON output enabled and parses the response.
 *
 * @param args Command arguments passed after cmux global JSON flags.
 * @returns Parsed JSON command output.
 */
export async function runCmuxJsonCommand<T>(args: string[]): Promise<T> {
	const cmuxArgs = ["--json", "--id-format", "both", ...args];
	return new Promise<T>((resolve, reject) => {
		const child = spawn(getCmuxExecutablePath(), cmuxArgs, {
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		const timeout = setTimeout(() => {
			child.kill("SIGTERM");
			reject(new Error(`cmux command timed out: ${args.join(" ")}`));
		}, CMUX_COMMAND_TIMEOUT_MS);

		child.stdout?.setEncoding("utf8");
		child.stderr?.setEncoding("utf8");
		child.stdout?.on("data", (chunk: string) => {
			stdout += chunk;
		});
		child.stderr?.on("data", (chunk: string) => {
			stderr += chunk;
		});
		child.once("error", (error) => {
			clearTimeout(timeout);
			reject(error);
		});
		child.once("close", (code) => {
			clearTimeout(timeout);
			if (code !== 0) {
				reject(
					new Error(
						stderr.trim() || `cmux exited with code ${code ?? "unknown"}`,
					),
				);
				return;
			}
			try {
				resolve(JSON.parse(stdout) as T);
			} catch (error) {
				reject(error);
			}
		});
	});
}
