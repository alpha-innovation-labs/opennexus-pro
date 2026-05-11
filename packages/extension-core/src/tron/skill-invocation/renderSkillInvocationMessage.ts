import type { SkillInvocationMessageComponent } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/skill-invocation-message.js";
import { theme } from "@nexus/pi-platform/theme.js";
import { CompactToolRow } from "../shared/compact-row/CompactToolRow.ts";

/**
 * Renders a collapsed skill invocation with Tron tool-call chrome.
 *
 * @param component Pi skill invocation component.
 * @param width Available render width.
 * @returns Rendered skill invocation lines.
 */
export function renderSkillInvocationMessage(component: SkillInvocationMessageComponent, width: number): string[] {
  const skillBlock = (component as unknown as { skillBlock?: { name?: unknown } }).skillBlock;
  const name = typeof skillBlock?.name === "string" && skillBlock.name.trim() ? skillBlock.name.trim() : "skill";
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
