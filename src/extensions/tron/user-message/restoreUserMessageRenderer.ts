import { setUserMessageRenderHook } from "../../../pi-internals/userMessageHook.js";

/**
 * Restores the default user-message renderer.
 */
export function restoreUserMessageRenderer(): void {
	setUserMessageRenderHook(undefined as any);
}
