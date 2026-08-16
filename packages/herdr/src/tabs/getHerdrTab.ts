/**
 * Gets details for a single Herdr tab.
 * Mirrors `herdr tab get`.
 *
 * @param tabId The tab ID (e.g. "w42:t1").
 * @returns Tab details including label, number, and paneCount.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function getHerdrTab(tabId: string): {
	tabId: string;
	label?: string;
	number: number;
	paneCount: number;
} {
	const result = runHerdr(["tab", "get", tabId]);
	const tab = (result.result as Record<string, unknown>)?.tab as
		| Record<string, unknown>
		| undefined;

	if (!tab) {
		throw new Error(
			`Failed to get tab ${tabId}: ${JSON.stringify(result)}`,
		);
	}

	return {
		tabId: (drill(tab, "tab_id") ?? "") as string,
		label: drill(tab, "label"),
		number: (tab.number as number) ?? 0,
		paneCount: (tab.pane_count as number) ?? 0,
	};
}
