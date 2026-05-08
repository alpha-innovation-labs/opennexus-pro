import { getPromptQueuePath } from "./getPromptQueuePath.js";
import type { PromptQueueController } from "./PromptQueueController.js";
import { readPromptQueueItems } from "./readPromptQueueItems.js";

/**
 * Hydrates a prompt queue controller from persisted disk state.
 *
 * @param controller Prompt queue controller to hydrate.
 * @param sessionId Current session id.
 */
export async function loadPromptQueueController(controller: PromptQueueController, sessionId: string): Promise<void> {
  controller.hydrate(await readPromptQueueItems(getPromptQueuePath(sessionId)));
}
