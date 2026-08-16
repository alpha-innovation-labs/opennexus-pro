/**
 * Closes a Herdr tab, cleaning up its panes and agents.
 * Mirrors `herdr tab close`.
 *
 * @param tabId The tab ID to close (e.g. "w42:t1").
 */

import { runHerdr } from "../core/runHerdr.js";

export function closeHerdrTab(tabId: string): void {
	try {
		runHerdr(["tab", "close", tabId]);
		console.error(`  ✓ Tab ${tabId} closed.`);
	} catch {
		// Ignore — tab may already be closed.
	}
}
