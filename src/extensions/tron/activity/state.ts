/**
 * Cached border ownership for one rendered activity item.
 */
export type ActivityNeighbors = { isFirst: boolean; isLast: boolean };

/**
 * Callback that re-renders one activity component.
 */
export type ActivityInvalidator = () => void;

/**
 * Cached first/last ownership for tool rows.
 */
export const toolNeighbors = new Map<string, ActivityNeighbors>();

/**
 * Latest invalidator for each activity key.
 */
export const activityInvalidators = new Map<string, ActivityInvalidator>();

/**
 * Current contiguous tool-call group.
 */
export let activeToolGroup: string[] = [];

/**
 * Tool ids whose first row should visually attach to prior thinking.
 */
export const bridgedToolCallIds = new Set<string>();

/**
 * Replaces the current active tool group.
 *
 * @param toolCallIds Contiguous tool-call ids.
 */
export function setActiveToolGroup(toolCallIds: string[]): void {
	activeToolGroup = toolCallIds;
}
