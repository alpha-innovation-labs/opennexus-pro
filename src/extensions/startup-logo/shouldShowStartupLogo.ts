/**
 * Returns whether the startup logo should be shown for the session start reason.
 *
 * @param reason Session start reason.
 * @returns True when the startup logo should be rendered.
 */
export function shouldShowStartupLogo(reason: string): boolean {
	return reason === "startup" || reason === "new" || reason === "fork";
}
