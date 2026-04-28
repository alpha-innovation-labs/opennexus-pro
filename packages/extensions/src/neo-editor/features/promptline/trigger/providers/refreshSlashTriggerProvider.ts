import { closeTriggerModal } from "../closeTriggerModal.js";
import { refreshSlashTrigger } from "../refreshSlashTrigger.js";
import { removeTriggerPrefixFromLines } from "../removeTriggerPrefixFromLines.js";
import { ensureSlashTriggerModal } from "./ensureSlashTriggerModal.js";
import { getSlashTriggerModal } from "./getSlashTriggerModal.js";
import type { TriggerProviderRefreshArgs } from "../types.js";

/**
 * Refreshes the `/` trigger provider.
 *
 * @param args Shared trigger refresh arguments.
 * @returns Empty trigger refresh result.
 */
export async function refreshSlashTriggerProvider(
  args: TriggerProviderRefreshArgs,
): Promise<{ autocompletePrefix?: string }> {
  ensureSlashTriggerModal(
    args.modalState,
    args.ctx,
    () => {
      args.setText(removeTriggerPrefixFromLines(args.lines, args.cursorLine, args.cursorCol, args.triggerState.prefix));
      closeTriggerModal(args.modalState, args.requestRender);
    },
    args.requestRender,
    args.setText,
    args.getThinkingLevel,
    args.setThinkingLevel,
    args.getCommands,
    args.submitText,
    args.showOverlay,
  );

  const modal = getSlashTriggerModal(args.modalState);
  if (!modal) {
    closeTriggerModal(args.modalState, args.requestRender);
    return {};
  }

  await refreshSlashTrigger(modal, args.triggerState.prefix);
  return {};
}
