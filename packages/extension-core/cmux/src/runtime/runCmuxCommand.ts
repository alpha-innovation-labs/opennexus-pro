import { spawn } from "node:child_process";
import { getCmuxExecutablePath } from "./getCmuxExecutablePath";

/**
 * Executes a cmux CLI command.
 *
 * @param args Command arguments passed to cmux.
 * @returns True when cmux exits successfully.
 */
export async function runCmuxCommand(args: string[]): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const child = spawn(getCmuxExecutablePath(), args, {
			stdio: "ignore",
		});
		child.once("error", () => resolve(false));
		child.once("close", (code) => resolve(code === 0));
	});
}
