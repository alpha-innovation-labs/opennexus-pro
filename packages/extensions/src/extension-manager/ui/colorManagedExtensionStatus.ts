import type { ManagedExtensionStatus } from "../model/types.js";

/**
 * Colors an extension enabled status using the feature-management palette.
 *
 * @param status Extension status to render.
 * @param theme Theme color formatter.
 * @returns Colored status label.
 */
export function colorManagedExtensionStatus(
	status: ManagedExtensionStatus,
	theme: { fg(color: string, value: string): string },
): string {
	return theme.fg(status === "enabled" ? "syntaxType" : "error", status);
}
