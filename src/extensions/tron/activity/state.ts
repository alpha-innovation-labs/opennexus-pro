/**
 * Cached first/last ownership for one rendered activity item.
 */
export type ActivityNeighbors = { isFirst: boolean; isLast: boolean };

/**
 * Callback that re-renders one activity component.
 */
export type ActivityInvalidator = () => void;

/**
 * Latest invalidator for each activity row.
 */
export const activityInvalidators = new Map<string, ActivityInvalidator>();

/**
 * Tool ids whose first row should visually attach to prior thinking.
 */
export const bridgedToolCallIds = new Set<string>();
