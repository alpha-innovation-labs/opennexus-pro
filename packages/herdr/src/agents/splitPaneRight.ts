/**
 * Splits a pane to the right and returns the new pane ID.
 *
 * @param paneId The pane to split. If omitted, splits the current pane.
 * @returns The pane_id of the newly split pane.
 * @throws If the split fails or returns no pane_id.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function splitPaneRight(paneId?: string): string {
	const args = ["pane", "split", "--direction", "right"];
	if (paneId) {
		args.push("--pane", paneId);
	} else {
		args.push("--current");
	}
	const result = runHerdr(args, { timeoutMs: 10_000 });
	const newPaneId = drill(result, "result", "pane", "pane_id");

	if (!newPaneId) {
		throw new Error(
			`Split did not return a pane_id: ${JSON.stringify(result)}`,
		);
	}

	return newPaneId;
}
