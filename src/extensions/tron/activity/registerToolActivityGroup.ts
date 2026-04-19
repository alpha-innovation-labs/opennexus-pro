import { invalidateActivityKeys } from "./invalidateActivityKeys.ts";
import { toolActivityKey } from "./toolActivityKey.ts";
import { activeToolGroup, setActiveToolGroup, toolNeighbors } from "./state.ts";

/**
 * Registers one contiguous tool group and updates cached border ownership.
 *
 * @param toolCallIds Tool call ids in one contiguous group.
 */
export function registerToolActivityGroup(toolCallIds: string[]): void {
	const previousGroup = [...activeToolGroup];
	const uniqueIds = toolCallIds.filter((toolCallId, index) => toolCallId && toolCallIds.indexOf(toolCallId) === index);
	setActiveToolGroup([...uniqueIds]);

	for (const [index, toolCallId] of uniqueIds.entries()) {
		toolNeighbors.set(toolActivityKey(toolCallId), {
			isFirst: index === 0,
			isLast: index === uniqueIds.length - 1,
		});
	}

	const changedKeys = [...new Set([...previousGroup, ...uniqueIds].map((toolCallId) => toolActivityKey(toolCallId)))];
	invalidateActivityKeys(changedKeys);
}
