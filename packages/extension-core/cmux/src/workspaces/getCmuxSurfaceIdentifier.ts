import type { CmuxSurface } from "./types";

/**
 * Gets the most stable identifier available for a cmux surface.
 *
 * @param surface cmux surface.
 * @returns Surface UUID when present, otherwise the ref.
 */
export function getCmuxSurfaceIdentifier(surface: CmuxSurface): string {
	return surface.id || surface.ref;
}
