import type { PlaygroundPaneState, PlaygroundState } from "../types.js";

/**
 * Returns one playground pane by key.
 *
 * @param state Playground runtime state.
 * @param paneKey Target pane key.
 * @returns Matching pane state.
 */
export function getPlaygroundPane(state: PlaygroundState, paneKey: string): PlaygroundPaneState {
	return state.panes.find((pane) => pane.key === paneKey) ?? state.panes[0];
}
