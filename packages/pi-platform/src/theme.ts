/**
 * Re-exports the `theme` Proxy from @earendil-works/pi-coding-agent.
 *
 * The `theme` object is a Proxy that reads from `globalThis[THEME_KEY]`.
 * It is NOT exported from the package's public API (only `initTheme`,
 * `Theme` class, and theme-* utility functions are exported). This file
 * re-exports it so downstream extensions can access it via
 * `@nexus/pi-platform/theme.js`.
 */

import { homedir } from "node:os";

const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");

/**
 * A Proxy that forwards property access to the currently registered theme.
 * Throws if the theme has not been initialized via `initTheme()`.
 */
export const theme = new Proxy({}, {
  get(_target, prop) {
    const t = globalThis[THEME_KEY];
    if (!t) throw new Error("Theme not initialized. Call initTheme() first.");
    return t[prop as keyof typeof t];
  },
});

export { initTheme, getLanguageFromPath, getMarkdownTheme, getSelectListTheme, getSettingsListTheme, highlightCode, Theme } from "@earendil-works/pi-coding-agent";
