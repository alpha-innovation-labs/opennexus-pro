import { getTriggerSession } from "./sessionState.js";
import type { TriggerKind } from "./types.js";

/**
 * Returns the kind of the active trigger session.
 *
 * @returns Active trigger kind.
 */
export function getTriggerSessionKind(): TriggerKind | null {
  return getTriggerSession()?.kind ?? null;
}
