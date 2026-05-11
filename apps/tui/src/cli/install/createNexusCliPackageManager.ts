import { getAgentDir } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/config.js";
import { DefaultPackageManager } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/package-manager.js";
import { SettingsManager } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";

export type NexusCliPackageManagerRuntime = {
  packageManager: DefaultPackageManager;
  settingsManager: SettingsManager;
};

/**
 * Creates the Pi package manager after Nexus config patching has redirected settings paths.
 *
 * @param cwd Current command working directory.
 * @returns Package manager runtime backed by Nexus settings.
 */
export function createNexusCliPackageManager(cwd: string): NexusCliPackageManagerRuntime {
  const settingsManager = SettingsManager.create(cwd, getAgentDir());
  return { packageManager: new DefaultPackageManager({ cwd, agentDir: getAgentDir(), settingsManager }), settingsManager };
}
