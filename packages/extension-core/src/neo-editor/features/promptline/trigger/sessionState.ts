import type { TriggerKind, TriggerState } from "./types.js";

let activeTriggerSession: TriggerState | null = null;

/**
 * Starts one trigger session for the provided trigger kind and prefix.
 *
 * @param kind Trigger kind.
 * @param prefix Initial trigger prefix.
 */
export function startTriggerSession(kind: TriggerKind, prefix: string): void {
  activeTriggerSession = { kind, prefix };
}

/**
 * Returns the active trigger session.
 *
 * @returns Active trigger session.
 */
export function getTriggerSession(): TriggerState | null {
  return activeTriggerSession;
}

/**
 * Updates the active trigger session prefix when it is still valid.
 *
 * @param prefix Latest trigger prefix.
 */
export function updateTriggerSessionPrefix(prefix: string): void {
  if (!activeTriggerSession) return;
  activeTriggerSession = { ...activeTriggerSession, prefix };
}

/**
 * Clears any active trigger session.
 */
export function clearTriggerSession(): void {
  activeTriggerSession = null;
}
