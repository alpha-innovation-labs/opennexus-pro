import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Formats a login provider row so configured providers are fully accent-colored.
 *
 * @param item Provider row.
 * @param icon Provider state icon.
 * @param theme Active UI theme.
 * @returns Provider row label with configured state coloring.
 */
export function formatLoginProviderLabel(item: SlashMenuLeaf, icon: string, theme: SelectPreviewTheme): string {
	const label = `${icon} ${item.label}`;
	if (item.currentValue === "configured") return theme.fg("accent", label);
	return `${theme.fg("text", icon)} ${item.label}`;
}
