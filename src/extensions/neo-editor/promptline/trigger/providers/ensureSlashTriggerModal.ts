import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createSlashModal } from "../createSlashModal.js";
import type { TriggerModalState } from "../types.js";

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
  submitText: (value: string) => void,
  showOverlay: ExtensionContext["ui"]["showOverlay"],
): void {
  if (modalState.slashModal) return;
  const created = createSlashModal(ctx, requestClose, requestRender, setText, getThinkingLevel, setThinkingLevel, submitText, showOverlay);
  modalState.slashModal = created.modal;
  modalState.handle = created.handle;
}
