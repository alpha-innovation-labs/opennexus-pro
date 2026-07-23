import { createSubagentScheduler } from "./createSubagentScheduler.js";
import { getConfiguredConcurrency } from "./getConfiguredConcurrency.js";

/**
 * Shared scheduler for background subagent runs.
 */
export const sharedSubagentScheduler = createSubagentScheduler(getConfiguredConcurrency());
