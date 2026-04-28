import type { CSSProperties } from "react";

/**
 * Returns the shared monospace style used by Nexus terminal mockups.
 *
 * @param fontSize Font size in pixels.
 * @returns CSS style for terminal text.
 */
export function terminalTextStyle(fontSize: number): CSSProperties {
  return {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize,
    lineHeight: 1.22,
    whiteSpace: "pre-wrap",
  };
}
