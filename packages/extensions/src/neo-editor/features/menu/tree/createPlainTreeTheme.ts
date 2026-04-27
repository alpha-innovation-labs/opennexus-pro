import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

/**
 * Creates a plain fallback theme for tests and direct callers.
 *
 * @returns Theme-like plain text helpers.
 */
export function createPlainTreeTheme(): ExtensionCommandContext["ui"]["theme"] {
  return {
    fg: (_color: string, value: string) => value,
    bold: (value: string) => value,
    italic: (value: string) => value,
    strikethrough: (value: string) => value,
  } as ExtensionCommandContext["ui"]["theme"];
}
