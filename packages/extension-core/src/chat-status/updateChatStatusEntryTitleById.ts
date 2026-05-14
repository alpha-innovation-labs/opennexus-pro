import { getChatStatusFilePath } from "./getChatStatusFilePath.js";
import { hasChatStatusEntry } from "./hasChatStatusEntry.js";
import { readChatStatusFile } from "./readChatStatusFile.js";
import { updateChatStatusEntryTitle } from "./updateChatStatusEntryTitle.js";
import { withChatStatusFileLock } from "./withChatStatusFileLock.js";
import { writeChatStatusFile } from "./writeChatStatusFile.js";

/**
 * Updates the persisted title for one active chat-status entry.
 *
 * @param entryId Active chat-status entry id.
 * @param sessionTitle Latest session title.
 */
export async function updateChatStatusEntryTitleById(entryId: string, sessionTitle: string): Promise<void> {
  const filePath = getChatStatusFilePath();
  await withChatStatusFileLock(filePath, async () => {
    const file = await readChatStatusFile(filePath);
    if (!hasChatStatusEntry(file, entryId)) return;
    await writeChatStatusFile(filePath, updateChatStatusEntryTitle(file, entryId, sessionTitle));
  });
}
