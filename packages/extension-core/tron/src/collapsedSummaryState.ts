import type { ActivityNeighbors } from "./activity/state";

/**
 * Display order for collapsed thinking-summary leaders.
 */
export const collapsedSummaryOrder: string[] = [];

/**
 * Cached first/last ownership for collapsed thinking summaries.
 */
export const collapsedSummaryNeighbors = new Map<string, ActivityNeighbors>();
