import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Checks whether the RTK binary is available in PATH.
 *
 * @param pi Pi extension API.
 * @param cwd Current working directory.
 * @param signal Optional abort signal.
 * @param command RTK command or absolute path.
 * @returns True when RTK can be executed.
 */
export async function hasRtkBinary(
	pi: ExtensionAPI,
	cwd: string,
	signal?: AbortSignal,
	command = "rtk",
): Promise<boolean> {
	try {
		const result = await pi.exec(command, ["--version"], { cwd, signal });
		return result.code === 0;
	} catch {
		return false;
	}
}
