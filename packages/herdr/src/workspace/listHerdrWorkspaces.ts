/**
 * Lists all Herdr workspaces.
 * Mirrors `herdr workspace list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of workspace summaries.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function listHerdrWorkspaces(
	workspaceId?: string,
): Array<{ workspaceId: string; label?: string; number: number }> {
	const args = ["workspace", "list"];
	if (workspaceId) {
		args.push("--workspace", workspaceId);
	}

	const result = runHerdr(args);
	const workspaces = (result.result as Record<string, unknown>)
		?.workspaces as Array<Record<string, unknown>> | undefined;

	if (!Array.isArray(workspaces)) {
		throw new Error(
			`Unexpected workspace list response: ${JSON.stringify(result)}`,
		);
	}

	return workspaces.map((ws) => ({
		workspaceId: (drill(ws, "workspace_id") ?? "") as string,
		label: drill(ws, "label"),
		number: (ws.number as number) ?? 0,
	}));
}
