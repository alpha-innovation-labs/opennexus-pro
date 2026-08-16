/**
 * Runs a shell command in a raw terminal pane.
 * Mirrors `herdr pane run <paneId> <command>`.
 *
 * @param paneId The pane ID to run the command in.
 * @param command The shell command to execute.
 * @param options Optional timeout override.
 * @returns Object containing success, output, and optional error.
 */

import { runHerdr } from "../core/runHerdr.js";

export interface RunCommandInPaneResult {
	success: boolean;
	output: string;
	error?: string;
}

export function runCommandInPane(
	paneId: string,
	command: string,
	{ timeoutMs = 30_000 }: { timeoutMs?: number } = {},
): RunCommandInPaneResult {
	const result = runHerdr(
		["pane", "run", paneId, command],
		{ timeoutMs },
	);

	// `herdr pane run` outputs the command output as raw text (not JSON).
	const raw = (result as { _raw?: string })._raw ?? "";

	// Check if the result contains an error field.
	const jsonResult = result as Record<string, unknown>;
	const errorInfo = jsonResult.error as Record<string, string> | undefined;

	if (errorInfo?.code) {
		return {
			success: false,
			output: raw || "",
			error: errorInfo.message ?? errorInfo.code,
		};
	}

	return {
		success: true,
		output: raw,
	};
}
