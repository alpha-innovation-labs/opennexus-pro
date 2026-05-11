import { annotationMiniAppManifest } from "../annotation/manifest.js";
import { automationsMiniAppManifest } from "../automations/command/manifest.js";
import { socialAutomationMiniAppManifest } from "../social-automation/command/manifest.js";
import { socialChatMiniAppManifest } from "../social-chat/command/manifest.js";
import { walletMiniAppManifest } from "../wallet/command/manifest.js";
import type { MiniAppManifest } from "./MiniAppManifest.js";

/**
 * Returns the bundled mini-app manifests in CLI routing order.
 *
 * @returns Ordered mini-app manifest list.
 */
export function getMiniAppManifests(): MiniAppManifest[] {
	return [automationsMiniAppManifest, socialAutomationMiniAppManifest, socialChatMiniAppManifest, annotationMiniAppManifest, walletMiniAppManifest];
}
