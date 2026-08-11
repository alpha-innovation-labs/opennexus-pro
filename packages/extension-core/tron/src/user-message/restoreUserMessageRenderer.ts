import { setUserMessageRenderHook } from "@nexus/pi-platform/userMessageHook";

/**
 * Restores the default user-message renderer.
 */
export function restoreUserMessageRenderer(): void {
	setUserMessageRenderHook(undefined);
}
