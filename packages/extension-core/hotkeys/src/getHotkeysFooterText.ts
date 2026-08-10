/**
 * Builds the hotkeys modal footer text.
 *
 * @param filterActive Whether filter mode is active.
 * @param filterQuery Current filter query.
 * @param scrollOffset Current scroll offset.
 * @param maxScroll Maximum scroll offset.
 * @returns Footer help text.
 */
export function getHotkeysFooterText(filterActive: boolean, filterQuery: string, scrollOffset: number, maxScroll: number): string {
  if (filterActive) return `Filter: ${filterQuery || "type keys or labels"} · Backspace edits · Enter/Esc exits filter`;
  return `j/k scroll ${scrollOffset}/${maxScroll} · gg top · G bottom · / filter · Esc/Ctrl+C/? closes · q closes`;
}
