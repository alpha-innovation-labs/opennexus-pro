/**
 * Lists all tabs, optionally filtered by workspace.
 * Mirrors `herdr tab list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of tab summaries.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function listHerdrTabs(
	workspaceId?: string,
): Array<{ tabId: string; label?: string; number: number }> {
	const args = ["tab", "list"];
	if (workspaceId) {
		args.push("--workspace", workspaceId);
	}

	const result = runHerdr(args);
	const tabs = (result.result as Record<string, unknown>)
		?.tabs as Array<Record<string, unknown>> | undefined;

	if (!Array.isArray(tabs)) {
		throw new Error(
			`Unexpected tab list response: ${JSON.stringify(result)}`,
		);
	}

	return tabs.map((tab) => ({
		tabId: (drill(tab, "tab_id") ?? "") as string,
		label: drill(tab, "label"),
		number: (tab.number as number) ?? 0,
	}));
}
