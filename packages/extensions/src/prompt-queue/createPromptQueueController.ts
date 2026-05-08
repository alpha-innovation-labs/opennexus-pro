import { getPromptQueuePath } from "./getPromptQueuePath.js";
import { PromptQueueController } from "./PromptQueueController.js";
import { writePromptQueueItems } from "./writePromptQueueItems.js";

/**
 * Creates the persisted Neo editor prompt queue controller for one session.
 *
 * @param sessionId Current session id.
 * @returns Prompt queue controller wired to disk persistence.
 */
export function createPromptQueueController(sessionId: string): PromptQueueController {
  const filePath = getPromptQueuePath(sessionId);
  return new PromptQueueController((items) => {
    void writePromptQueueItems(filePath, items);
  });
}
