/**
 * Starts an agent in a pane with inherited stdio (foreground blocking).
 * Use this when the caller should wait for the agent to finish,
 * e.g. when the CLI or extension tool is the terminal itself.
 *
 * @param agentName The agent name.
 * @param paneId    The pane to start in.
 * @param options   Optional skills to preload.
 * @returns The process exit status.
 */

import { spawn, spawnSync } from "node:child_process";

export function startForegroundAgent(
	agentName: string,
	paneId: string,
	options?: {
		skills?: string[];
		stdio?: "inherit" | "pipe";
		blocking?: boolean;
	},
): number {
	const { stdio: stdioOption = "inherit", blocking = false } = options ?? {};
	const args = [
		"agent",
		"start",
		agentName,
		"--kind",
		"mastracode",
		"--pane",
		paneId,
		"--",
		"--no-skills",
		"--minimal",
	];

	if (blocking) {
		const result = spawnSync("herdr", args, {
			encoding: "utf-8",
			stdio: stdioOption,
			timeout: 0,
		});
		return result.status ?? 0;
	}

	spawn("herdr", args, {
		stdio: stdioOption === "inherit" ? "inherit" : "pipe",
		timeout: 0,
	});
	return 0;
}
