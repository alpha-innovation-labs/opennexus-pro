import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createAtModal } from "../createAtModal";
import type { TriggerModalState, ShowOverlay } from "../types";

/**
 * Ensures the `@` modal exists.
 *
 * @param modalState Shared modal state.
 * @param ctx Extension context.
 * @param uiTheme UI theme.
 * @param onAutocompletePick Pick handler.
 * @param requestClose Close handler.
 * @param requestRender Render callback.
 * @param showOverlay Overlay factory.
 */
export function ensureAtTriggerModal(
  modalState: TriggerModalState,
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  onAutocompletePick: (item: AutocompleteItem) => void,
  requestClose: () => void,
  requestRender: () => void,
  showOverlay: ShowOverlay,
): void {
  if (modalState.atModal) return;
  const created = createAtModal(ctx, uiTheme, onAutocompletePick, requestClose, requestRender, showOverlay);
  modalState.atModal = created.modal;
  modalState.handle = created.handle;
}
