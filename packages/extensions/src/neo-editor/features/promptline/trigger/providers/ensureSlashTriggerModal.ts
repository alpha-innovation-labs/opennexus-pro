import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createSlashModal } from "../createSlashModal.js";
import type { TriggerModalState, ShowOverlay } from "../types.js";

/**
 * Ensures the `/` modal exists.
 *
 * @param modalState Shared modal state.
 * @param ctx Extension context.
 * @param requestClose Close handler.
 * @param requestRender Render callback.
 * @param setText Editor text setter.
 * @param getThinkingLevel Thinking-level getter.
 * @param setThinkingLevel Thinking-level setter.
 * @param getCommands Live slash-command getter.
 * @param submitText Editor submit callback.
 * @param showOverlay Overlay factory.
 */
export function ensureSlashTriggerModal(
  modalState: TriggerModalState,
  ctx: ExtensionContext,
  requestClose: () => void,
  requestRender: () => void,
  setText: (value: string) => void,
  getThinkingLevel: () => string,
  setThinkingLevel: (value: string) => void,
  getCommands: ExtensionAPI["getCommands"],
  submitText: (value: string) => void,
  showOverlay: ShowOverlay,
): void {
  if (modalState.slashModal) return;
  const created = createSlashModal(ctx, requestClose, requestRender, setText, getThinkingLevel, setThinkingLevel, submitText, showOverlay, getCommands);
  modalState.slashModal = created.modal;
  modalState.handle = created.handle;
}
