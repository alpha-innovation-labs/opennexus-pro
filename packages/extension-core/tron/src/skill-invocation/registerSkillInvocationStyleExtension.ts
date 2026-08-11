import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { installSkillInvocationMessageRenderHook } from "./installSkillInvocationMessageRenderHook";

/**
 * Registers Tron styling for skill invocation messages.
 *
 * @param _pi Extension API.
 */
export default function registerSkillInvocationStyleExtension(
	_pi: ExtensionAPI,
): void {
	logExtensionEvent("skill-invocation-style", "init");
	installSkillInvocationMessageRenderHook();
}
