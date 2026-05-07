import type { SharedModalHotkey } from "./types.js";

/**
 * Returns the default body-scroll hotkeys for overflowing shared modals.
 *
 * @returns Default shared modal scroll hotkey hints.
 */
export function getBaseScrollHotkeys(): SharedModalHotkey[] {
  return [
    { key: "j/k", label: "scroll" },
    { key: "gg/G", label: "top/bottom" },
    { key: "Ctrl+D/U", label: "half page" },
  ];
}
