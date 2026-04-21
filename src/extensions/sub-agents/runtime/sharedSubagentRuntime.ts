import { createSubagentRuntime } from "./createSubagentRuntime.js";

/**
 * Shared singleton runtime used by the subagent execution and UI extensions.
 */
export const sharedSubagentRuntime = createSubagentRuntime();
