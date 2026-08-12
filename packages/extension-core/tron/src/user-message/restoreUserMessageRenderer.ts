import { setUserMessageRenderHook } from "@nexus/pi-platform";

/**
 * Restores the default user-message renderer.
 */
export function restoreUserMessageRenderer(): void {
	setUserMessageRenderHook(undefined);
}
