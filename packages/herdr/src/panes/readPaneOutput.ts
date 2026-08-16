/**
 * Reads terminal output from a raw pane.
 * Mirrors `herdr pane read <paneId>`.
 *
 * @param paneId The pane ID to read output from.
 * @param options Optional lines and source parameters.
 * @returns Object containing the raw output text.
 */

import { runHerdr } from "../core/runHerdr.js";

export interface ReadPaneOutputResult {
	_raw: string;
}

export function readPaneOutput(
	paneId: string,
	{ lines = 50, source = "recent" }: { lines?: number; source?: "recent" | "visible" | "recent-unwrapped" } = {},
): ReadPaneOutputResult {
	const result = runHerdr(["pane", "read", paneId, "--lines", String(lines), "--source", source]);

	// `herdr pane read` outputs terminal content as raw text (not JSON).
	const raw = (result as { _raw?: string })._raw ?? "";

	return { _raw: raw };
}
