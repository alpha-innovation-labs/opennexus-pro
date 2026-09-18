import type { ToolOutputScrollState } from '../ToolOutputViewport';
import type { DiffViewState } from './types';

/**
 * Per-toolCallId diff view state, keyed by tool call.
 *
 * The compact transcript renders each tool result as a FRESH DiffRenderer on
 * every paint, so per-instance fields are lost between frames. Mode is stored
 * here (module-level, keyed by toolCallId) so the freshly-constructed renderer
 * recovers its previous mode. Body scroll position lives in a separate map
 * ({@link getDiffScrollState}) because it is mutated by the viewport on every
 * wheel/drag event and needs to survive renderer rebuilds.
 */
const diffViewState = new Map<string, DiffViewState>();
const diffScrollStates = new Map<string, ToolOutputScrollState>();

export function getDiffState(toolCallId: string): DiffViewState | undefined {
	return diffViewState.get(toolCallId);
}

export function setDiffState(toolCallId: string, state: DiffViewState): void {
	diffViewState.set(toolCallId, state);
}

/**
 * Persistent body scroll position for one tool call. Returns the SAME object
 * across renderer rebuilds so the viewport's wheel/drag mutations persist.
 * The pinned mode bar is not part of this — it is always rendered at the top.
 */
export function getDiffScrollState(toolCallId: string): ToolOutputScrollState {
	let s = diffScrollStates.get(toolCallId);
	if (!s) {
		s = { top: 0 };
		diffScrollStates.set(toolCallId, s);
	}
	return s;
}

/**
 * Reset the body scroll to the top when a tool collapses, so a fresh
 * re-expansion starts at the top rather than at the previous scroll offset.
 */
export function resetDiffScroll(toolCallId: string): void {
	diffScrollStates.delete(toolCallId);
}
