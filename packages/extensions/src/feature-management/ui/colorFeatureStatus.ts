import type { FeatureRuntimeStatus } from "../model/types.js";

/**
 * Colors a runtime status using the same Tron success/error palette slots.
 *
 * @param status Runtime status to render.
 * @param theme Theme color formatter.
 * @returns Colored status label.
 */
export function colorFeatureStatus(
	status: FeatureRuntimeStatus,
	theme: { fg(color: string, value: string): string },
): string {
	return theme.fg(status === "enabled" ? "syntaxType" : "error", status);
}
