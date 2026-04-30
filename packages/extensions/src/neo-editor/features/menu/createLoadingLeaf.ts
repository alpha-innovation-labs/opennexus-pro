import type { SlashMenuLeaf } from "./types.js";

/**
 * Creates a disabled-looking leaf used while an async menu level loads.
 *
 * @param label Visible loading label.
 * @returns Placeholder slash-menu leaf.
 */
export function createLoadingLeaf(label: string): SlashMenuLeaf {
	return {
		kind: "choice",
		label,
		description: "Loading latest data…",
		value: "__loading__",
	};
}
