import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createChatStatusEntry } from "./createChatStatusEntry.js";
import { getChatStatusFilePath } from "./getChatStatusFilePath.js";
import { readChatStatusFile } from "./readChatStatusFile.js";
import { upsertChatStatusEntry } from "./upsertChatStatusEntry.js";
import { withChatStatusFileLock } from "./withChatStatusFileLock.js";
import { writeChatStatusFile } from "./writeChatStatusFile.js";

/**
 * Registers the active Nexus chat as currently running.
 *
 * @param ctx Extension context for the active session.
 */
export async function registerCurrentChatStatus(ctx: ExtensionContext): Promise<void> {
  const filePath = getChatStatusFilePath();
  await withChatStatusFileLock(filePath, async () => {
    const file = await readChatStatusFile(filePath);
    await writeChatStatusFile(filePath, upsertChatStatusEntry(file, createChatStatusEntry(ctx, new Date().toISOString())));
  });
}
