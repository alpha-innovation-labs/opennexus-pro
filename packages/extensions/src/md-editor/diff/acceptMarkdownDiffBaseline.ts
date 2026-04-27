import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";

/**
 * Accepts the live Markdown snapshot as the new diff baseline.
 */
export function acceptMarkdownDiffBaseline(snapshot: MarkdownFileSnapshot): MarkdownFileSnapshot {
	return snapshot;
}
