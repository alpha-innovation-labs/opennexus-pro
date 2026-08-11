/**
 * Recreates Pi's internal `theme` proxy so downstream tron code can
 * access `theme.fg()`, `theme.bold()`, and `theme.italic()` without
 * importing the proxy from Pi (which intentionally does not re-export it).
 *
 * This mirrors the implementation in Pi's source:
 *   const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");
 *   export const theme = new Proxy({}, { get(_target, prop) { … } });
 */

const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");

/**
 * Minimal theme interface used by tron rendering code.
 * Mirrors Pi's internal theme object shape.
 */
export interface Theme {
	fg: (colorName: string, text: string) => string;
	bold: (text: string) => string;
	italic: (text: string) => string;
}

/**
 * A Proxy that forwards property access to the currently registered theme.
 * Throws if the theme has not been initialized via `initTheme()`.
 */
export const theme: Theme = new Proxy({} as Theme, {
	get(_target, prop) {
		const t = (globalThis as Record<symbol, Theme | undefined>)[THEME_KEY];
		if (!t) throw new Error("Theme not initialized. Call initTheme() first.");
		return t[prop as keyof Theme];
	},
});
