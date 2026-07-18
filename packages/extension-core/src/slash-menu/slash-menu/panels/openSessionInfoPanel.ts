import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { showSessionInfoModal } from "../../session-info/showSessionInfoModal.ts";

/**
 * Opens the session info panel. Closes the slash menu.
 */
export async function openSessionInfoPanel(
  ctx: ExtensionContext,
  requestClose: () => void,
): Promise<void> {
  requestClose();
  await showSessionInfoModal(ctx);
}
