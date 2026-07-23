import { getChatStatusFilePath } from "@nexus/extensions/chat-status/getChatStatusFilePath.js";

/**
 * Prints the active chat-status file path.
 */
export function printChatStatusFileLocation(): void {
  console.log(getChatStatusFilePath());
}
