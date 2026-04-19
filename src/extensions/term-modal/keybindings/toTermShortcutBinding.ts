import type { TermShortcutBinding } from "../types.js";
import { resolveTermVariables } from "./resolveTermVariables.js";
import { toShortcutKeys } from "./toShortcutKeys.js";

/**
 * Converts one custom keybindings entry into a terminal shortcut binding.
 *
 * @param name Shortcut name suffix.
 * @param value Shortcut config entry.
 * @param variables Terminal variable dictionary.
 * @returns Parsed shortcut binding or null when invalid.
 */
export function toTermShortcutBinding(
	name: string,
	value: unknown,
	variables: Record<string, string>,
): TermShortcutBinding | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}
	const entry = value as Record<string, unknown>;
	const keys = toShortcutKeys(entry.key ?? entry.keys);
	if (!keys.length) {
		return null;
	}
	const command = typeof entry.command === "string" ? resolveTermVariables(entry.command, variables) : null;
	const descriptionValue = typeof entry.description === "string" ? entry.description : `Run terminal shortcut ${name}.`;
	return {
		name,
		keys,
		description: resolveTermVariables(descriptionValue, variables),
		command,
	};
}
