import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { countSessionEntries } from "./countSessionEntries.js";
import { formatSessionCount } from "./formatSessionCount.js";

/**
 * Builds display rows for Nexus-owned session info UI.
 *
 * @param ctx Extension context.
 * @returns Session info rows.
 */
export function createSessionInfoRows(ctx: ExtensionContext): string[] {
  const sessionManager = ctx.sessionManager as ExtensionContext["sessionManager"] & {
    getSessionFile?: () => string | undefined;
    getLeafId?: () => string | null | undefined;
  };
  const entries = sessionManager.getEntries() as Array<{ type?: string; message?: { role?: string; content?: unknown } }>;
  const counts = countSessionEntries(entries);
  const title = sessionManager.getSessionName()?.trim() || "Untitled session";
  return [
    `Title: ${title}`,
    `Session ID: ${sessionManager.getSessionId()}`,
    `Model: ${ctx.model ?? "unknown"}`,
    `Working directory: ${ctx.cwd}`,
    `Session file: ${sessionManager.getSessionFile?.() ?? "not persisted"}`,
    `Session directory: ${sessionManager.getSessionDir()}`,
    `Current leaf: ${sessionManager.getLeafId?.() ?? "none"}`,
    "",
    "Counts",
    formatSessionCount("Entries", counts.total),
    formatSessionCount("User messages", counts.user),
    formatSessionCount("Assistant messages", counts.assistant),
    formatSessionCount("Tool results", counts.toolResult),
    formatSessionCount("Thinking blocks", counts.thinking),
  ];
}
