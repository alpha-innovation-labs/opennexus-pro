import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/**
 * Builds the promptline status content line within the requested frame width.
 *
 * @param badges Rendered model and thinking badges.
 * @param runTime Rendered runtime label, or undefined when hidden.
 * @param sessionName Session name, or undefined when hidden.
 * @param width Status frame width.
 * @param theme UI theme.
 * @returns Width-constrained status content.
 */
export function buildPromptlineStatusLine(
	badges: string,
	runTime: string | undefined,
	sessionName: string | undefined,
	width: number,
	theme: ExtensionContext["ui"]["theme"],
): string {
	const gap = " ";
	if (!runTime)
		return truncateToWidth(badges, width, theme.fg("dim" as never, "…"));
	const titleRaw = theme.fg("muted" as never, sessionName ?? "");
	const titlePrefix = `${badges}${gap}`;
	const titleWidth =
		width -
		visibleWidth(titlePrefix) -
		visibleWidth(runTime) -
		visibleWidth(gap);
	if (titleWidth <= 0) {
		const right = truncateToWidth(runTime, width, "");
		const leftWidth = Math.max(0, width - visibleWidth(right) - 1);
		const left = truncateToWidth(badges, leftWidth, "");
		return left + " ".repeat(Math.max(0, width - visibleWidth(left) - visibleWidth(right))) + right;
	}
	const title = truncateToWidth(
		titleRaw,
		titleWidth,
		theme.fg("dim" as never, "…"),
	);
	const left = `${titlePrefix}${title}`;
	const padding = " ".repeat(
		Math.max(1, width - visibleWidth(left) - visibleWidth(runTime)),
	);
	return `${left}${padding}${runTime}`;
}
