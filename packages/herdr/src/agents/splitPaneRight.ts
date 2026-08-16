/**
 * Splits the current pane to the right and returns the new pane ID.
 *
 * @returns The pane_id of the newly split pane.
 * @throws If the split fails or returns no pane_id.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function splitPaneRight(): string {
	const result = runHerdr(
		["pane", "split", "--current", "--direction", "right"],
		{ timeoutMs: 10_000 },
	);
	const paneId = drill(result, "result", "pane", "pane_id");

	if (!paneId) {
		throw new Error(
			`Split did not return a pane_id: ${JSON.stringify(result)}`,
		);
	}

	return paneId;
}
