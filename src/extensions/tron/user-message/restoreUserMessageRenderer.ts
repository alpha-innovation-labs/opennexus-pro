import { setUserMessageRenderHook } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/user-message.js";

/**
 * Restores the default user-message renderer.
 */
export function restoreUserMessageRenderer(): void {
	setUserMessageRenderHook(undefined as any);
}
