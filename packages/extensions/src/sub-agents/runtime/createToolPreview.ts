/**
 * Creates a compact tool preview for a live child tool execution.
 *
 * @param toolName Tool name.
 * @param args Raw tool arguments.
 * @returns Compact preview string.
 */
export function createToolPreview(toolName: string | undefined, args: Record<string, unknown> | undefined): string {
  if (!toolName) return "tool";
  if (toolName === "bash") return `$ ${String(args?.command ?? "")}`.slice(0, 80);
  if (toolName === "read") return `read ${String(args?.path ?? "")}`;
  if (toolName === "write") return `write ${String(args?.path ?? "")}`;
  if (toolName === "edit") return `edit ${String(args?.path ?? "")}`;
  if (toolName === "grep") return `grep ${String(args?.pattern ?? "")}`;
  if (toolName === "find") return `find ${String(args?.pattern ?? "")}`;
  if (toolName === "ls") return `ls ${String(args?.path ?? ".")}`;
  return `${toolName} ${JSON.stringify(args ?? {})}`.slice(0, 80);
}
