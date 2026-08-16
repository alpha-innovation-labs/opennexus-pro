/**
 * Lists all panes, optionally filtered by workspace.
 * Mirrors `herdr pane list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of pane summaries.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function listHerdrPanes(
	workspaceId?: string,
): Array<{ paneId: string; agent?: string; status: string }> {
	const args = ["pane", "list"];
	if (workspaceId) {
		args.push("--workspace", workspaceId);
	}

	const result = runHerdr(args);
	const panes = (result.result as Record<string, unknown>)
		?.panes as Array<Record<string, unknown>> | undefined;

	if (!Array.isArray(panes)) {
		throw new Error(
			`Unexpected pane list response: ${JSON.stringify(result)}`,
		);
	}

	return panes.map((pane) => ({
		paneId: (drill(pane, "pane_id") ?? "") as string,
		agent: drill(pane, "agent_status"),
		status: (drill(pane, "agent_status") ?? "unknown") as string,
	}));
}
