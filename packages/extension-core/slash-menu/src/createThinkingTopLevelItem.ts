import type { SlashMenuSection } from "./types";

/**
 * Builds the root thinking menu item shown alongside auth/model commands.
 *
 * @returns Root thinking slash-menu item.
 */
export function createThinkingTopLevelItem(): SlashMenuSection {
	return {
		label: "thinking",
		description: "Set reasoning depth for thinking-capable models.",
		groupLabel: "Auth",
		value: "thinking",
	};
}
