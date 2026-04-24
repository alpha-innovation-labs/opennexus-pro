import type { BuiltInTools } from "./types.ts";

/**
 * Cache of cwd-and-runtime-specific built-in tool instances.
 */
export const toolCache = new Map<string, BuiltInTools>();
