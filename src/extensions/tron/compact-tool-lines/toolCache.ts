import type { BuiltInTools } from "./types.ts";

/**
 * Cache of cwd-specific built-in tool instances.
 */
export const toolCache = new Map<string, BuiltInTools>();
