import type { AutocompleteProvider } from "@earendil-works/pi-tui";
import type { AtModal } from "../AtModal.js";

/**
 * Refreshes the `@` modal suggestions from the active prefix.
 *
 * @param modal At modal.
 * @param provider Autocomplete provider.
 * @param lines Editor lines.
 * @param cursorLine Cursor line.
 * @param cursorCol Cursor column.
 * @param abortController Abort controller.
 * @param requestRender Render callback.
 */
export async function refreshAtTrigger(
  modal: AtModal,
  provider: AutocompleteProvider,
  lines: string[],
  cursorLine: number,
  cursorCol: number,
  abortController: AbortController,
  requestRender: () => void,
): Promise<{ prefix: string } | null> {
  const suggestions = await provider.getSuggestions(lines, cursorLine, cursorCol, {
    signal: abortController.signal,
    force: false,
  });
  if (abortController.signal.aborted || !suggestions) return null;
  const prefix = suggestions.prefix ?? "";
  if (!prefix.startsWith("@")) return null;
  modal.setMode("file");
  modal.setQuery(prefix.replace(/^@/, ""));
  modal.setItems(suggestions.items ?? []);
  requestRender();
  return { prefix };
}
