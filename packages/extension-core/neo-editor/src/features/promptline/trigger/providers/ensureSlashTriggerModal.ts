import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createSlashModal } from "../createSlashModal";
import type { TriggerModalState, ShowOverlay } from "../types";

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
 * @param getAllTools Live tool metadata getter.
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
  getAllTools: ExtensionAPI["getAllTools"],
  submitText: (value: string) => void,
  showOverlay: ShowOverlay,
): void {
  if (modalState.slashModal) return;
  const created = createSlashModal(ctx, requestClose, requestRender, setText, getThinkingLevel, setThinkingLevel, submitText, showOverlay, getCommands, getAllTools);
  modalState.slashModal = created.modal;
  modalState.handle = created.handle;
}
