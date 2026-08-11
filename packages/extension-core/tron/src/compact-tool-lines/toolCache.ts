import type { BuiltInTools } from "./types";

/**
 * Cache of cwd-and-runtime-specific built-in tool instances.
 */
export const toolCache = new Map<string, BuiltInTools>();
