import { buildSessionContext, loadEntriesFromFile } from "@earendil-works/pi-coding-agent/dist/core/session-manager.js";
import type { TranscriptEntry } from "../../tron/transcript/types.js";
import { extractMessageText } from "./extractMessageText.js";
import { getMessageCreatedAt } from "./getMessageCreatedAt.js";
import { toAssistantTranscriptEntries } from "./toAssistantTranscriptEntries.js";

/**
 * Converts one persisted Nexus session file into Tron-style transcript entries.
 *
 * @param sessionPath Absolute persisted session path.
 * @returns Transcript entries for the active session branch.
 */
export function toSessionTranscriptEntries(sessionPath: string): TranscriptEntry[] {
  const entries = loadEntriesFromFile(sessionPath);
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
