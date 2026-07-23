import { getAgentDir } from "@earendil-works/pi-coding-agent/dist/config.js";
import { DefaultPackageManager } from "@earendil-works/pi-coding-agent/dist/core/package-manager.js";
import { SettingsManager } from "@earendil-works/pi-coding-agent/dist/core/settings-manager.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import type { ConfiguredPackage } from "@earendil-works/pi-coding-agent/dist/core/package-manager.js";

export type NexusCliPackageManagerRuntime = {
  packageManager: DefaultPackageManager;
};

/**
 * Creates the Pi package manager after Nexus config patching has redirected settings paths.
 * Patches listConfiguredPackages to also read from extensions.pi_packages.
 *
 * @param cwd Current command working directory.
 * @returns Package manager runtime backed by Nexus settings.
 */
export function createNexusCliPackageManager(cwd: string): NexusCliPackageManagerRuntime {
  const settingsManager = SettingsManager.create(cwd, getAgentDir());
  const packageManager = new DefaultPackageManager({ cwd, agentDir: getAgentDir(), settingsManager });
  const originalListConfiguredPackages = packageManager.listConfiguredPackages.bind(packageManager);
  packageManager.listConfiguredPackages = function () {
    const configuredPackages = originalListConfiguredPackages();
    const userConfig = readNexusUserConfig();
    const piPackages = userConfig.extensions?.pi_packages;
    if (piPackages) {
      for (const source of Object.keys(piPackages)) {
        if (!configuredPackages.find((p) => p.source === source)) {
          configuredPackages.push({
            source,
            scope: "user" as const,
            filtered: false,
            installedPath: packageManager.getInstalledPath(source, "user"),
          });
        }
      }
    }
    return configuredPackages;
  };
  return { packageManager };
}
