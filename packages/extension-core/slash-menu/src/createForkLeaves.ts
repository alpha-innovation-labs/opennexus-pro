import type { SlashMenuLeaf } from "./types";

/**
 * Builds forkable user-message leaves from the current session branch.
 *
 * @param entries Session entries.
 * @returns Fork leaves.
 */
export function createForkLeaves(entries: Array<{ id: string; type: string; message?: { role?: string; content?: unknown } }>): SlashMenuLeaf[] {
  return entries
    .filter((entry) => entry.type === "message" && entry.message?.role === "user")
    .map((entry, index) => ({
      kind: "entry",
      label: `#${index + 1} ${summarizeContent(entry.message?.content)}`,
      description: "",
      value: entry.id,
    }));
}

/**
 * Summarizes one message block for slash-menu previews.
 *
 * @param content Message content.
 * @returns One-line summary.
 */
function summarizeContent(content: unknown): string {
  if (typeof content === "string") return content.slice(0, 160);
  if (!Array.isArray(content)) return "User message";
  return content
    .map((block) => (typeof block === "object" && block && "type" in block && (block as { type?: string }).type === "text" ? (block as { text?: string }).text ?? "" : ""))
    .join(" ")
    .slice(0, 160) || "User message";
}
