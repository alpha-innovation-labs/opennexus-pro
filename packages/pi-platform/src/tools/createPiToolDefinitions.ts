import { createAllToolDefinitions } from "@earendil-works/pi-coding-agent/dist/core/tools/index.js";

export interface PiToolDefinition {
  name: string;
  description: string;
  promptSnippet?: string;
}

/**
 * Creates Pi's built-in tool definitions through a statically bundled import.
 *
 * @param cwd Current working directory passed to Pi tool definition factories.
 * @returns Built-in Pi tool definitions keyed by tool name.
 */
export function createPiToolDefinitions(cwd: string): Record<string, PiToolDefinition> {
  return createAllToolDefinitions(cwd) as Record<string, PiToolDefinition>;
}
