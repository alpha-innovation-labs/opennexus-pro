import type { FeatureReleaseChannel } from "../model/types.js";

/**
 * Colors a release channel using the same Tron success/error palette slots.
 *
 * @param channel Release channel to render.
 * @param theme Theme color formatter.
 * @returns Colored channel label.
 */
export function colorFeatureChannel(
	channel: FeatureReleaseChannel,
	theme: { fg(color: string, value: string): string },
): string {
	return theme.fg(channel === "production" ? "syntaxType" : "error", channel);
}
