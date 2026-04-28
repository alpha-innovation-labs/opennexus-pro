import type { AutocompleteItem, AutocompleteProvider } from "@mariozechner/pi-tui";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { closeTriggerModal } from "./closeTriggerModal.js";
import { getTriggerProvider } from "./getTriggerProvider.js";
import type { ShowOverlay, TriggerModalState, TriggerState } from "./types.js";

/**
 * Refreshes the active trigger modal for `@` or `/`.
 *
 * @param triggerState Active trigger state.
 * @param modalState Mutable modal state.
 * @param ctx Extension context.
 * @param uiTheme UI theme.
 * @param autocompleteProvider Autocomplete provider.
 * @param getThinkingLevel Thinking-level getter.
 * @param setThinkingLevel Thinking-level setter.
 * @param getCommands Live slash-command getter.
 * @param lines Editor lines.
 * @param cursorLine Cursor line.
 * @param cursorCol Cursor column.
 * @param requestRender Render callback.
 * @param setText Editor text setter.
 * @param submitText Editor submit callback.
 * @param onAutocompletePick Pick handler.
 * @param showOverlay Overlay factory.
 * @returns Active `@` prefix when available.
 */
export async function refreshTriggerModal(
  triggerState: TriggerState | null,
  modalState: TriggerModalState,
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  autocompleteProvider: AutocompleteProvider | undefined,
  getThinkingLevel: () => string,
  setThinkingLevel: (value: string) => void,
  getCommands: ExtensionAPI["getCommands"],
  lines: string[],
  cursorLine: number,
  cursorCol: number,
  requestRender: () => void,
  setText: (value: string) => void,
  submitText: (value: string) => void,
  onAutocompletePick: (item: AutocompleteItem) => void,
  showOverlay: ShowOverlay,
): Promise<{ autocompletePrefix?: string }> {
  if (!triggerState) {
    closeTriggerModal(modalState, requestRender);
    return {};
  }

  return getTriggerProvider(triggerState.kind).refresh({
    triggerState,
    modalState,
    ctx,
    uiTheme,
    autocompleteProvider,
    getThinkingLevel,
    setThinkingLevel,
    getCommands,
    lines,
    cursorLine,
    cursorCol,
    requestRender,
    setText,
    submitText,
    onAutocompletePick,
    showOverlay,
  });
}
