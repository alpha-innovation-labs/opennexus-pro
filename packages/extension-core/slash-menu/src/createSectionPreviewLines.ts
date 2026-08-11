import type { SlashMenuSection } from "./types";

/**
 * Builds right-pane preview text for one top-level section.
 *
 * @param section Selected section.
 * @returns Preview lines.
 */
export function createSectionPreviewLines(section: SlashMenuSection): string[] {
	return [
		section.label,
		"",
		section.description,
		"",
		"Enter opens this section.",
		"Esc goes back.",
		"Ctrl+C closes.",
	];
}
