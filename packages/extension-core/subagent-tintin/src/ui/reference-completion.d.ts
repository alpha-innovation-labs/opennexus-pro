import type { AutocompleteItem, AutocompleteProvider } from "@earendil-works/pi-tui";

/** Display-only roster snapshot; contains no session objects or execution hooks. */
export interface AgentReferencePreview {
  handle: string;
  type: string;
  typeLabel?: string;
  description?: string;
  action: "start" | "send message" | "resume" | "continue in main conversation";
  /** Available type resolved from a session-less record's inserted handle. */
  startType?: string;
  status?: string;
  model?: string;
  sessionFile?: string;
  toolUses?: number;
}

/** In-process picker metadata, preserved by wrappers (never serialized). */
export interface ReferenceCompletionItem extends AutocompleteItem {
  reference?: {
    kind: "agent" | "file" | "folder";
    identity: string;
    agent?: AgentReferencePreview;
    source: AutocompleteProvider;
    prefix: string;
    /** Captures the original item and prefix, not the merged response prefix. */
    apply: (lines: string[], cursorLine: number, cursorCol: number) => ReturnType<AutocompleteProvider["applyCompletion"]>;
  };
}
