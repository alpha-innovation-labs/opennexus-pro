import { Key, matchesKey } from "@earendil-works/pi-tui";
import type { PromptQueueController } from "./PromptQueueController.js";

export type PromptQueueInputHandlers = {
  loadText(text: string, itemId: string): void;
  requestRender(): void;
  sendText(text: string): void;
};

/**
 * Routes keyboard input while prompt queue navigation is focused.
 *
 * @param data Raw keyboard input.
 * @param queue Prompt queue controller.
 * @param handlers Editor callbacks used for load/send/render side effects.
 * @returns True when input was consumed by queue navigation.
 */
export function handlePromptQueueInput(data: string, queue: PromptQueueController, handlers: PromptQueueInputHandlers): boolean {
  if (!queue.isFocused()) return false;
  if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrlShift("m"))) {
    queue.blur();
    handlers.requestRender();
    return true;
  }
  if (data === "d") {
    if (queue.hasPendingDeleteKey()) {
      const item = queue.getSelected();
      if (item) queue.remove(item.id);
      handlers.requestRender();
      return true;
    }
    queue.setPendingDeleteKey(true);
    handlers.requestRender();
    return true;
  }
  queue.setPendingDeleteKey(false);
  if (data === "j" || data === "l" || matchesKey(data, Key.down)) {
    queue.move(1);
    handlers.requestRender();
    return true;
  }
  if (data === "k" || data === "h" || matchesKey(data, Key.up)) {
    queue.move(-1);
    handlers.requestRender();
    return true;
  }
  if (data === "e") {
    const item = queue.getSelected();
    if (!item) return true;
    handlers.loadText(item.text, item.id);
    queue.blur();
    handlers.requestRender();
    return true;
  }
  if (matchesKey(data, Key.enter) || matchesKey(data, Key.ctrl("enter"))) {
    const item = queue.getSelected();
    if (!item) return true;
    queue.remove(item.id);
    handlers.sendText(item.text);
    return true;
  }
  return true;
}
