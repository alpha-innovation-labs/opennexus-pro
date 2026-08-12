import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/slash-menu";
import { showFeaturesModal } from "./command/showFeaturesModal";

/**
 * Registers the feature management command.
 * Pi packages are displayed within /features.
 *
 * @param pi Extension API.
 */
export function registerFeatureManagementExtensionWithConfig(
	pi: ExtensionAPI,
): void {
	pi.registerCommand(
		"features",
		withSlashMenuGroup(
			{
				description: "Show feature flags and release channels",
				handler: async (_args, ctx) => {
					await showFeaturesModal(ctx);
				},
			},
			"Extensions",
		),
	);
}
