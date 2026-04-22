import { getTriggerSession } from "./sessionState.js";
import { getTriggerState } from "./getTriggerState.js";
import type { TriggerState } from "./types.js";

/**
 * Resolves the currently active trigger state for the ongoing trigger session.
 *
 * @param textBeforeCursor Text before the cursor.
 * @returns Active trigger state or null.
 */
export function getActiveTriggerState(textBeforeCursor: string): TriggerState | null {
  const session = getTriggerSession();
  if (!session) return null;
  const current = getTriggerState(textBeforeCursor);
  if (!current || current.kind !== session.kind) return null;
  return current;
}
