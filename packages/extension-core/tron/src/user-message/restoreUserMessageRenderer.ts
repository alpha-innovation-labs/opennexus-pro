import { setUserMessageRenderHook } from "@nexus/pi-platform/userMessageHook.js";

/**
 * Restores the default user-message renderer.
 */
export function restoreUserMessageRenderer(): void {
	setUserMessageRenderHook(undefined as any);
}
