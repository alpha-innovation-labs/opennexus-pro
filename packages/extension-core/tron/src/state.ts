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

/**
 * Tool ids that close a thinking-to-tool shared box when they have no visible result.
 */
export const bridgedToolCallClosingIds = new Set<string>();

/**
 * Tool ids whose compact call row should render the top border.
 */
export const toolCallTopBorderIds = new Set<string>();

/**
 * Tool ids whose compact call row should render the bottom border.
 */
export const toolCallBottomBorderIds = new Set<string>();

/**
 * Tool ids whose compact frame state has been synchronized from assistant content.
 */
export const toolCallFrameSyncedIds = new Set<string>();

/**
 * Last visible tool call in the synchronized assistant activity stream.
 */
export const toolActivityFrameCursor: { lastToolCallId?: string } = {};
