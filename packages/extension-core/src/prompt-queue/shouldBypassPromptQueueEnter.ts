import { Key, matchesKey } from "@earendil-works/pi-tui";

/**
 * Decides whether prompt-queue should leave Enter to Neo editor internals.
 *
 * @param data Raw keyboard input.
 * @param isShowingAutocomplete Whether base autocomplete is open.
 * @param hasTriggerModal Whether an @ or slash trigger modal is open.
 * @returns True when Enter should not send or queue.
 */
export function shouldBypassPromptQueueEnter(data: string, isShowingAutocomplete: boolean, hasTriggerModal: boolean): boolean {
  return matchesKey(data, Key.enter) && (isShowingAutocomplete || hasTriggerModal);
}
