import { getTriggerSession } from "./sessionState";
import type { TriggerKind } from "./types";

/**
 * Returns the kind of the active trigger session.
 *
 * @returns Active trigger kind.
 */
export function getTriggerSessionKind(): TriggerKind | null {
  return getTriggerSession()?.kind ?? null;
}
