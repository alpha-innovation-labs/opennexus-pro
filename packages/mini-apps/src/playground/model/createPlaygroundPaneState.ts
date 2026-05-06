import type { PlaygroundPaneState } from "../types.js";

/**
 * Creates mutable runtime state for one playground child Pi pane.
 *
 * @param key Stable pane key.
 * @param title Display title.
 * @returns Fresh pane state.
 */
export function createPlaygroundPaneState(key: string, title: string): PlaygroundPaneState {
	return {
		key,
		title,
		client: null,
		unsubscribe: null,
		transcript: [],
		liveAssistantText: "",
		status: "Ready",
		busy: false,
	};
}
