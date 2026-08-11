import { buildSessionContext, parseSessionEntries, SessionManager } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";

// loadEntriesFromFile is not exported from the package — re-implemented here.
function loadEntriesFromFileStub(filePath: string): ReturnType<typeof parseSessionEntries> {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, "utf8");
  const entries = parseSessionEntries(content);
  if (entries.length === 0) return entries;
  const header = entries[0];
  if (header.type !== "session" || typeof (header as unknown as Record<string, unknown>).id !== "string") {
    return [];
  }
  return entries;
}
import type { TranscriptEntry } from "@extensions/tron/transcript/types";
import { extractMessageText } from "./extractMessageText";
import { getMessageCreatedAt } from "./getMessageCreatedAt";
import { toAssistantTranscriptEntries } from "./toAssistantTranscriptEntries";

/**
 * Converts one persisted Nexus session file into Tron-style transcript entries.
 *
 * @param sessionPath Absolute persisted session path.
 * @returns Transcript entries for the active session branch.
 */
export function toSessionTranscriptEntries(sessionPath: string): TranscriptEntry[] {
  const entries = loadEntriesFromFileStub(sessionPath);
  const sessionContext = buildSessionContext(entries as never);

  return sessionContext.messages.flatMap((message: any) => {
    const createdAt = getMessageCreatedAt(message);
    if (message.role === "user") {
      return [{ role: "user" as const, text: extractMessageText(message.content), createdAt }];
    }
    if (message.role === "assistant") {
      return toAssistantTranscriptEntries(message);
    }
    if (message.role === "custom" || message.role === "compactionSummary" || message.role === "branchSummary" || message.role === "bashExecution") {
      return [{ role: "system" as const, text: extractMessageText(message.content) || String(message.command ?? message.summary ?? ""), createdAt }];
    }
    return [];
  }).filter((entry) => entry.text.trim().length > 0 || entry.role === "tool");
}
