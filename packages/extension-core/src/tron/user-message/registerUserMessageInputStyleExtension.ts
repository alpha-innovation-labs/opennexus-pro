import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { installUserMessageRenderHook } from "./installUserMessageRenderHook.ts";
import { registerUserMessageMetadataHandlers } from "./metadata/registerUserMessageMetadataHandlers.ts";
import { restoreUserMessageRenderer } from "./restoreUserMessageRenderer.ts";

/**
 * Registers the custom user-message styling extension.
 *
 * @param _pi Extension API.
 */
export default function registerUserMessageInputStyleExtension(_pi: ExtensionAPI): void {
	logExtensionEvent("user-message-input-style", "init");
	restoreUserMessageRenderer();
	installUserMessageRenderHook();
	registerUserMessageMetadataHandlers(_pi);
}
