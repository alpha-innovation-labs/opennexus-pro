import type { AutocompleteItem, AutocompleteProvider } from "@earendil-works/pi-tui";

/** In-process picker metadata, preserved by wrappers (never serialized). */
export interface ReferenceCompletionItem extends AutocompleteItem {
  reference?: {
    kind: "agent" | "file" | "folder";
    identity: string;
    source: AutocompleteProvider;
    prefix: string;
    /** Captures the original item and prefix, not the merged response prefix. */
    apply: (lines: string[], cursorLine: number, cursorCol: number) => ReturnType<AutocompleteProvider["applyCompletion"]>;
  };
}
