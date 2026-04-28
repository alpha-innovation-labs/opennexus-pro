import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { SlashMenuModal } from "../../menu/SlashMenuModal.js";
import type { TriggerModalHandle, ShowOverlay } from "./types.js";

/**
 * Creates and shows the slash trigger modal.
 *
 * @param ctx Extension context.
 * @param requestClose Close callback.
 * @param requestRender Render callback.
 * @param _setText Editor text setter.
 * @param getThinkingLevel Thinking-level getter.
 * @param setThinkingLevel Thinking-level setter.
 * @param submitText Editor submit callback.
 * @param showOverlay Overlay factory.
 * @param getCommands Live slash-command getter.
 * @returns Slash modal and handle.
 */
export function createSlashModal(
  ctx: ExtensionContext,
  requestClose: () => void,
  requestRender: () => void,
  _setText: (value: string) => void,
  getThinkingLevel: () => string,
  setThinkingLevel: (value: string) => void,
  submitText: (value: string) => void,
  showOverlay: ShowOverlay,
  getCommands: ExtensionAPI["getCommands"] = () => [],
): { modal: SlashMenuModal; handle: TriggerModalHandle } {
  const modal = new SlashMenuModal(ctx, getThinkingLevel, setThinkingLevel, requestClose, requestRender, (commandText) => {
    requestClose();
    requestRender();
    submitText(commandText);
  }, getCommands);
  const handle = showOverlay(modal, {
    anchor: "center",
    width: "100%",
    minWidth: 80,
    maxHeight: "85%",
  });
  return { modal, handle };
}
