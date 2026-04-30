import type { EditorTriggerConfig } from "./types.js";

/**
 * Returns bundled editor triggers that must work before any user config exists.
 *
 * @returns Built-in editor trigger config.
 */
export function getBundledEditorTriggerConfig(): EditorTriggerConfig {
  return {
    rules: [
      {
        match: { text: "/sessions", mode: "exact" },
        action: { type: "submit" },
      },
      {
        match: { text: "/reload", mode: "exact" },
        action: { type: "submit" },
      },
    ],
  };
}
