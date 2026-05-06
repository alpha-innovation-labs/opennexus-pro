import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { installSkillInvocationMessageRenderHook } from "./installSkillInvocationMessageRenderHook.ts";

/**
 * Registers Tron styling for skill invocation messages.
 *
 * @param _pi Extension API.
 */
export default function registerSkillInvocationStyleExtension(_pi: ExtensionAPI): void {
  logExtensionEvent("skill-invocation-style", "init");
  installSkillInvocationMessageRenderHook();
}
