import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability";
import { installUserMessageRenderHook } from "./installUserMessageRenderHook";
import { registerUserMessageMetadataHandlers } from "./metadata/registerUserMessageMetadataHandlers";
import { restoreUserMessageRenderer } from "./restoreUserMessageRenderer";

/**
 * Registers the custom user-message styling extension.
 *
 * @param _pi Extension API.
 */
export default function registerUserMessageInputStyleExtension(
	_pi: ExtensionAPI,
): void {
	logExtensionEvent("user-message-input-style", "init");
	restoreUserMessageRenderer();
	installUserMessageRenderHook();
	registerUserMessageMetadataHandlers(_pi);
}
