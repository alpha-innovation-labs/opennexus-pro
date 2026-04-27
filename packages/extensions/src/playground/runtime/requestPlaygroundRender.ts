import type { PlaygroundState } from "../types.js";

/**
 * Requests a repaint for the playground overlay when it is visible.
 *
 * @param state Playground runtime state.
 */
export function requestPlaygroundRender(state: PlaygroundState): void {
	state.requestRender?.();
}
