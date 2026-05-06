import { inspect } from "node:util";

/**
 * Formats a real Nexus tool call for the browser sidebar stream.
 *
 * @param toolName Tool name from the Nexus stream.
 * @param args Tool arguments from the Nexus stream.
 * @returns Compact tool call text.
 */
export function formatToolCallText(toolName: string | undefined, args: Record<string, unknown> | undefined): string {
  const name = toolName ?? "tool";
  if (!args || Object.keys(args).length === 0) return name;
  return `${name} ${inspect(args, { depth: 2, breakLength: 120 })}`;
}
