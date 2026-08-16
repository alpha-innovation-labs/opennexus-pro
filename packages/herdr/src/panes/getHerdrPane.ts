/**
 * Gets details for a single Herdr pane.
 * Mirrors `herdr pane get`.
 *
 * @param paneId The pane ID (e.g. "w42:p1").
 * @returns Pane details including agent status and cwd.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function getHerdrPane(paneId: string): {
	paneId: string;
	agent?: string;
	status: string;
	cwd?: string;
} {
	const result = runHerdr(["pane", "get", paneId]);
	const pane = (result.result as Record<string, unknown>)?.pane as
		| Record<string, unknown>
		| undefined;

	if (!pane) {
		throw new Error(
			`Failed to get pane ${paneId}: ${JSON.stringify(result)}`,
		);
	}

	return {
		paneId: (drill(pane, "pane_id") ?? "") as string,
		agent: drill(pane, "agent_status"),
		status: (drill(pane, "agent_status") ?? "unknown") as string,
		cwd: drill(pane, "cwd"),
	};
}
