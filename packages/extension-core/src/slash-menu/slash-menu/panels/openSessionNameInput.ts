import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { sanitizeSessionNameInput } from "../../sanitizeSessionNameInput.ts";
import { isSlashTextInput } from "../../isSlashTextInput.ts";

/**
 * Returns the initial name-input state. Pure function.
 */
export function initNameInput(ctx: ExtensionContext): string {
  return (ctx.sessionManager as { getSessionName?: () => string | undefined }).getSessionName?.() ?? "";
}

/**
 * Processes one keystroke in name-input mode. Returns the new name or null if unhandled.
 * Pure function.
 */
export function processNameInput(
  nameInput: string,
  data: string,
  onCommandPicked: (text: string) => void,
  handleEscape: () => Promise<void>,
): { nameInput: string; handled: true; action?: "escape" | "submit" } | { handled: false } {
  if (data === "\u001B") {
    void handleEscape();
    return { nameInput, handled: true, action: "escape" };
  }
  if (data === "\r" || data === "\n") {
    onCommandPicked(`/name ${sanitizeSessionNameInput(nameInput)}`);
    return { nameInput, handled: true, action: "submit" };
  }
  if (data === "\u007f" || data === "\b") {
    return { nameInput: nameInput.slice(0, -1), handled: true };
  }
  if (!isSlashTextInput(data) && data !== " ") return { handled: false };
  return { nameInput: nameInput + data, handled: true };
}
