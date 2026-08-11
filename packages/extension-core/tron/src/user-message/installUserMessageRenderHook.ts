import type { UserMessageComponent } from "@earendil-works/pi-coding-agent";
import { setUserMessageRenderHook } from "@nexus/pi-platform/userMessageHook";
import { renderCachedUserMessage } from "./renderCachedUserMessage";
import type { CachedUserMessageComponent } from "./renderCachedUserMessage";

/**
 * Installs the custom user-message renderer.
 */
export function installUserMessageRenderHook(): void {
	setUserMessageRenderHook((component: UserMessageComponent, width: number): string[] =>
		renderCachedUserMessage(component as unknown as CachedUserMessageComponent, width),
	);
}
