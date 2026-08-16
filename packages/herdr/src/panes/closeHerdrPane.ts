/**
 * Closes a Herdr pane.
 * Mirrors `herdr pane close`.
 *
 * @param paneId The pane ID to close (e.g. "w42:p1").
 */

import { runHerdr } from "../core/runHerdr.js";

export function closeHerdrPane(paneId: string): void {
	try {
		runHerdr(["pane", "close", paneId]);
		console.error(`  ✓ Pane ${paneId} closed.`);
	} catch {
		// Ignore — pane may already be closed.
	}
}
