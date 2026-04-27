import type { PlaygroundState } from "../types.js";

/**
 * Builds the combined playground status text for both panes.
 *
 * @param state Playground runtime state.
 * @returns Combined status text.
 */
export function getPlaygroundStatus(state: PlaygroundState): string {
	return state.panes.map((pane) => `${pane.title}: ${pane.status}`).join(" · ");
}
