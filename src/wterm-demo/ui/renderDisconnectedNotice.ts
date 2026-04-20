import type { WTerm } from "@wterm/dom";

/**
 * Prints a terminal notice when the backend process or socket ends.
 */
export function renderDisconnectedNotice(term: WTerm, message: string): void {
  term.write(message);
}
