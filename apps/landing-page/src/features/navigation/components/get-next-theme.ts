export type ThemeName = "dark" | "light";

/**
 * Resolves the next theme value after a user toggle.
 *
 * @param theme Current theme value.
 * @returns The next theme value.
 */
export function getNextTheme(theme: ThemeName): ThemeName {
	return theme === "dark" ? "light" : "dark";
}
