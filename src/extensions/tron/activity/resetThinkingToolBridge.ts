import { bridgedToolCallIds } from "./state.ts";

/**
 * Clears all cached thinking-to-tool bridge state.
 */
export function resetThinkingToolBridge(): void {
	bridgedToolCallIds.clear();
}
