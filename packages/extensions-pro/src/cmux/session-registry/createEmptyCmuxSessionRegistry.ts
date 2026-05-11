import type { CmuxSessionRegistry } from "./types.js";

/**
 * Creates an empty cmux session registry document.
 *
 * @returns Empty registry.
 */
export function createEmptyCmuxSessionRegistry(): CmuxSessionRegistry {
	return { version: 1, entries: [] };
}
