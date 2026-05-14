import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createChatStatusEntryId } from "./createChatStatusEntryId.js";
import { getChatStatusFilePath } from "./getChatStatusFilePath.js";
import { readChatStatusFile } from "./readChatStatusFile.js";
import { removeChatStatusEntry } from "./removeChatStatusEntry.js";
import { withChatStatusFileLock } from "./withChatStatusFileLock.js";
import { writeChatStatusFile } from "./writeChatStatusFile.js";

/**
 * Removes the active Nexus chat from the currently running chat-status list.
 *
 * @param ctx Extension context for the active session.
 */
export async function unregisterCurrentChatStatus(ctx: ExtensionContext): Promise<void> {
  const filePath = getChatStatusFilePath();
  await withChatStatusFileLock(filePath, async () => {
    const file = await readChatStatusFile(filePath);
    await writeChatStatusFile(filePath, removeChatStatusEntry(file, createChatStatusEntryId(ctx)));
  });
}
