import type { SlashMenuLeaf } from "./types";

/**
 * Formats a resource command list label with local/global scope indicator.
 *
 * @param icon Row icon.
 * @param item Resource command leaf.
 * @returns Formatted label.
 */
export function formatResourceCommandLabel(
	icon: string,
	item: SlashMenuLeaf,
): string {
	const scope =
		item.sourceScope === "project"
			? ""
			: item.sourceScope === "user"
				? ""
				: "?";
	return `${icon} ${scope} ${stripResourceCommandLabelPrefix(item)}`;
}

/**
 * Removes the command namespace from skill menu labels while keeping submissions unchanged.
 *
 * @param item Resource command leaf.
 * @returns Display label without the skill namespace when applicable.
 */
function stripResourceCommandLabelPrefix(item: SlashMenuLeaf): string {
	if (item.value.startsWith("skill:") && item.label.startsWith("skill:"))
		return item.label.slice("skill:".length);
	return item.label;
}
