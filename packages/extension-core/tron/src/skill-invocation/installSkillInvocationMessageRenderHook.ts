import { SkillInvocationMessageComponent } from "@earendil-works/pi-coding-agent";
import { renderSkillInvocationMessage } from "./renderSkillInvocationMessage";

const skillInvocationPrototype =
	SkillInvocationMessageComponent.prototype as SkillInvocationMessageComponent & {
		render(width: number): string[];
	};
const originalRender = skillInvocationPrototype.render;
let skillInvocationHookInstalled = false;

/**
 * Installs the Tron renderer for collapsed skill invocation messages.
 */
export function installSkillInvocationMessageRenderHook(): void {
	if (skillInvocationHookInstalled) return;
	skillInvocationPrototype.render = function renderWithTronSkillInvocation(
		width: number,
	): string[] {
		const expanded =
			(this as unknown as { expanded?: boolean }).expanded === true;
		if (expanded) return originalRender.call(this, width);
		return renderSkillInvocationMessage(this, width);
	};
	skillInvocationHookInstalled = true;
}
