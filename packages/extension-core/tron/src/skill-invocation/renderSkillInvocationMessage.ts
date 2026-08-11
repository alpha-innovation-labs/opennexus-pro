import type { SkillInvocationMessageComponent } from "@earendil-works/pi-coding-agent";
import { CompactToolRow } from "../shared/compact-row/CompactToolRow";
import { theme } from "../theme-proxy";

/**
 * Renders a collapsed skill invocation with Tron tool-call chrome.
 *
 * @param component Pi skill invocation component.
 * @param width Available render width.
 * @returns Rendered skill invocation lines.
 */
export function renderSkillInvocationMessage(
	component: SkillInvocationMessageComponent,
	width: number,
): string[] {
	const skillBlock = (
		component as unknown as { skillBlock?: { name?: unknown } }
	).skillBlock;
	const name =
		typeof skillBlock?.name === "string" && skillBlock.name.trim()
			? skillBlock.name.trim()
			: "skill";
	return new CompactToolRow({
		width,
		icon: "󰚄",
		label: "skill",
		main: name,
		options: "ctrl+o to expand",
		theme,
		showTopBorder: true,
		showBottomBorder: true,
	}).render();
}
