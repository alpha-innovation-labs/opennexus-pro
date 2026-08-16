/**
 * Gets details for a single Herdr workspace.
 * Mirrors `herdr workspace get`.
 *
 * @param workspaceId The workspace ID (e.g. "w42").
 * @returns Workspace details including label, number, tabCount, and paneCount.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function getHerdrWorkspace(
	workspaceId: string,
): {
	workspaceId: string;
	label?: string;
	number: number;
	tabCount: number;
	paneCount: number;
} {
	const result = runHerdr(["workspace", "get", workspaceId]);
	const ws = (result.result as Record<string, unknown>)?.workspace as
		| Record<string, unknown>
		| undefined;

	if (!ws) {
		throw new Error(
			`Failed to get workspace ${workspaceId}: ${JSON.stringify(result)}`,
		);
	}

	return {
		workspaceId: (drill(ws, "workspace_id") ?? "") as string,
		label: drill(ws, "label"),
		number: (ws.number as number) ?? 0,
		tabCount: (ws.tab_count as number) ?? 0,
		paneCount: (ws.pane_count as number) ?? 0,
	};
}
