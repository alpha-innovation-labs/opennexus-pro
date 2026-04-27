import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import { withSlashMenuGroup } from "../neo-editor/features/menu/withSlashMenuGroup.js";
import { showFeaturesModal } from "./command/showFeaturesModal.js";

/**
 * Registers the feature management command with an injected config provider.
 *
 * @param pi Extension API.
 * @param readConfig Config provider for the active runtime.
 */
export function registerFeatureManagementExtensionWithConfig(
	pi: ExtensionAPI,
	readConfig: () => FeatureFlagsConfig,
): void {
	pi.registerCommand("features", withSlashMenuGroup({
		description: "Show feature flags and release channels",
		handler: async (_args, ctx) => {
			await showFeaturesModal(ctx, readConfig);
		},
	}, "Developer"));
}
