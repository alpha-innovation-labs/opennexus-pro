import type { PlaygroundState } from "../types.js";
import { createPlaygroundPaneState } from "./createPlaygroundPaneState.js";

/**
 * Creates mutable runtime state for the playground extension.
 *
 * @returns Fresh playground state.
 */
export function createPlaygroundState(): PlaygroundState {
	return {
		ctx: null,
		overlayHandle: null,
		finish: null,
		requestRender: null,
		panes: [createPlaygroundPaneState("left", "Conversation A"), createPlaygroundPaneState("right", "Conversation B")],
		closing: false,
	};
}
