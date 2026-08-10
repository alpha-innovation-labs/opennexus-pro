/**
 * Decides whether the startup hero should include startup timing.
 *
 * @param importMetaUrl Current module URL retained for caller compatibility.
 * @returns True for source/dev runs and bundled release binaries.
 */
export function shouldShowStartupDurationBadge(importMetaUrl: string): boolean {
	void importMetaUrl;
	return true;
}
