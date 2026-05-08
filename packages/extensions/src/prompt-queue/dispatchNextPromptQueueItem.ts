import type { PromptQueueController } from "./PromptQueueController.js";

/**
 * Sends the next queued prompt and removes it from the persisted queue.
 *
 * @param promptQueue Prompt queue state controller.
 * @param sendUserMessage Function that starts a new assistant turn from text.
 * @returns True when one queued prompt was dispatched.
 */
export function dispatchNextPromptQueueItem(
  promptQueue: PromptQueueController,
  sendUserMessage: (text: string) => void,
): boolean {
  const item = promptQueue.dequeueNext();
  if (!item) return false;
  sendUserMessage(item.text);
  return true;
}
