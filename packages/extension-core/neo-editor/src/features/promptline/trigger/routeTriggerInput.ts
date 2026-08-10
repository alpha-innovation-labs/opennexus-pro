import { Key, matchesKey } from "@earendil-works/pi-tui";
import type { TriggerKind } from "./types";

/**
 * Decides whether the active trigger modal should capture the current key.
 *
 * @param kind Trigger kind.
 * @param data Raw terminal input.
 * @returns True when the modal should handle the key.
 */
export function routeTriggerInput(kind: TriggerKind, data: string): boolean {
  if (kind === "slash") {
    return true;
  }

  return matchesKey(data, Key.up)
    || matchesKey(data, Key.down)
    || matchesKey(data, Key.enter)
    || matchesKey(data, Key.escape)
    || matchesKey(data, Key.ctrl("n"))
    || matchesKey(data, Key.ctrl("p"))
    || matchesKey(data, Key.ctrl("c"));
}
