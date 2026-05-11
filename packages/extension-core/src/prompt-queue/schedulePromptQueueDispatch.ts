import type { PromptQueueController } from "./PromptQueueController.js";

export type PromptQueueTimer = (callback: () => void, delayMs: number) => unknown;

export const promptQueueDispatchGraceMs = 2500;
const promptQueueIdleRetryMs = 250;

/**
 * Schedules the next queue item for delayed auto-dispatch so users can cancel it.
 *
 * @param promptQueue Prompt queue state controller.
 * @param sendUserMessage Function that starts the next assistant turn.
 * @param requestRender UI render invalidator.
 * @param setTimer Timer implementation.
 * @param canSend Whether the runtime is ready to start the next turn.
 * @returns True when one item entered pending dispatch.
 */
export function schedulePromptQueueDispatch(
  promptQueue: PromptQueueController,
  sendUserMessage: (text: string) => void,
  requestRender: () => void,
  setTimer: PromptQueueTimer = setTimeout,
  canSend: () => boolean = () => true,
): boolean {
  if (promptQueue.isDispatchPending()) return false;
  const pending = promptQueue.beginPendingDispatch();
  if (!pending) return false;
  const tryDispatch = (): void => {
    if (!promptQueue.isPendingDispatchItem(pending.id)) return;
    if (!canSend()) {
      setTimer(tryDispatch, promptQueueIdleRetryMs);
      return;
    }
    try {
      sendUserMessage(pending.text);
      promptQueue.remove(pending.id);
    } catch {
      promptQueue.cancelPendingDispatch();
    }
    requestRender();
  };
  requestRender();
  setTimer(tryDispatch, promptQueueDispatchGraceMs);
  return true;
}
