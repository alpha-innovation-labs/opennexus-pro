import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
import { installUserMessageRenderHook } from "./installUserMessageRenderHook.ts";
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
}
