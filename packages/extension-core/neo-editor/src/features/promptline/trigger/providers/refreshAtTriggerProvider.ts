import type { AutocompleteItem, AutocompleteProvider } from "@earendil-works/pi-tui";
import { closeTriggerModal } from "../closeTriggerModal";
import { refreshAtTrigger } from "../refreshAtTrigger";
import { ensureAtTriggerModal, getAtTriggerModal } from "./ensureAtTriggerModal";
import type { TriggerProviderRefreshArgs } from "../types";

/**
 * Refreshes the `@` trigger provider.
 *
 * @param args Shared trigger refresh arguments.
 * @returns Active autocomplete prefix.
 */
export async function refreshAtTriggerProvider(
  args: TriggerProviderRefreshArgs,
): Promise<{ autocompletePrefix?: string }> {
  const provider = args.autocompleteProvider;
  if (!provider) {
    closeTriggerModal(args.modalState, args.requestRender);
    return {};
  }

  ensureAtTriggerModal(
    args.modalState,
    args.ctx,
    args.uiTheme,
    args.onAutocompletePick,
    () => closeTriggerModal(args.modalState, args.requestRender),
    args.requestRender,
    args.showOverlay,
  );

  args.modalState.abort?.abort();
  const abortController = new AbortController();
  args.modalState.abort = abortController;
  const modal = getAtTriggerModal(args.modalState);
  if (!modal) {
    closeTriggerModal(args.modalState, args.requestRender);
    return {};
  }
  const refreshed = await refreshAtTrigger(
    modal,
    provider,
    args.lines,
    args.cursorLine,
    args.cursorCol,
    abortController,
    args.requestRender,
  );
  if (!refreshed) {
    closeTriggerModal(args.modalState, args.requestRender);
    return {};
  }
  return { autocompletePrefix: refreshed.prefix };
}
