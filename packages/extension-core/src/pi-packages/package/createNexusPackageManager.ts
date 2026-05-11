import { getAgentDir } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/config.js";
import { DefaultPackageManager } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/core/package-manager.js";
import { SettingsManager } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/core/settings-manager.js";

/** Package manager plus the settings manager that persists its changes. */
export type NexusPackageManagerRuntime = {
	packageManager: DefaultPackageManager;
	settingsManager: SettingsManager;
};

/**
 * Creates Pi's package manager after Nexus config patching has redirected settings paths.
 *
 * @param cwd Current command working directory.
 * @returns Package manager runtime backed by Nexus settings.
 */
export function createNexusPackageManager(cwd: string): NexusPackageManagerRuntime {
	const settingsManager = SettingsManager.create(cwd, getAgentDir());
	return { packageManager: new DefaultPackageManager({ cwd, agentDir: getAgentDir(), settingsManager }), settingsManager };
}
