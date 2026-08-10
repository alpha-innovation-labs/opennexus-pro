import { readBundledDefaultSettings } from "./readBundledDefaultSettings";
import { mergeSettings, type SettingsRecord } from "./mergeSettings";
import { readNexusUserConfig } from "./readNexusUserConfig";

type NexusSettingsManagerInstance = {
  globalSettings: SettingsRecord;
  projectSettings: SettingsRecord;
  settings: SettingsRecord;
};

type NexusSettingsManagerClass = {
  __nexusConfigPatched__?: boolean;
  fromStorage(storage: unknown): NexusSettingsManagerInstance;
};

/**
 * Patches Pi runtime config lookups so Nexus uses shipped app defaults
 * and converts Nexus-style package config into Pi-expected format.
 *
 * Converts Nexus-style `extensions.pi_packages` (stored as
 * `{ "npm:pi-chrome": true }`) into Pi-expected `globalSettings.packages`
 * (an array of source strings like `["npm:pi-chrome"]`).
 *
 * Does NOT replace Pi's file-based settings system. Pi reads its own
 * settings files normally. This patch only intercepts
 * `getGlobalSettings()` to inject the converted packages array.
 *
 * @returns Promise that resolves after the patch is installed.
 */
export async function applyNexusConfigPatch(): Promise<void> {
  const [{ SettingsManager }] = await Promise.all([
    import("@earendil-works/pi-coding-agent"),
  ]);

  const patchedSettingsManager = SettingsManager as unknown as NexusSettingsManagerClass;
  if (patchedSettingsManager.__nexusConfigPatched__) {
    return;
  }

  const appDefaults = readBundledDefaultSettings();
  const originalFromStorage = patchedSettingsManager.fromStorage;

  patchedSettingsManager.fromStorage = function fromStorageWithNexusDefaults(storage: unknown) {
    const manager = originalFromStorage.call(this, storage) as unknown as NexusSettingsManagerInstance;
    manager.globalSettings = mergeSettings(appDefaults, manager.globalSettings);
    manager.settings = mergeSettings(manager.globalSettings, manager.projectSettings);
    // Convert Nexus-style extensions.pi_packages to Pi-expected packages array format.
    // Pi's resolver reads `globalSettings.packages` as an array of package source strings.
    // Nexus stores it as { pi_packages: { name: bool } }. Convert on-the-fly.
    // Also clear `globalSettings.extensions` when it's in Nexus object format,
    // because Pi's resolver expects `extensions` to be an array of file paths.
    const nexusUserConfig = readNexusUserConfig();
    const nexusExt = nexusUserConfig.extensions;
    let convertedPackages: string[] | undefined;
    let clearedExtensions: unknown;
    if (nexusExt && typeof nexusExt === "object" && !Array.isArray(nexusExt)) {
      const piPackages = (nexusExt as Record<string, unknown>).pi_packages;
      if (piPackages && typeof piPackages === "object") {
        // Convert { "npm:pi-chrome": true } to ["npm:pi-chrome"],
        // but EXCLUDE packages explicitly set to false so they never
        // reach Pi's resolver and are never loaded.
        const existingPackages = (manager.globalSettings as Record<string, unknown>).packages ?? [];
        const merged = [...existingPackages];
        for (const [src, enabled] of Object.entries(piPackages)) {
          // Only inject source strings whose value is truthy (true or omitted).
          // When the user sets a source to false, skip it entirely so Pi
          // never sees it and never loads it.
          if (enabled) {
            if (!merged.includes(src)) {
              merged.push(src);
            }
          }
        }
        convertedPackages = merged;
        clearedExtensions = undefined;
      }
    }
    // Patch getGlobalSettings to return the converted version.
    // We can't modify globalSettings in place because getGlobalSettings() returns
    // structuredClone(this.globalSettings), so modifications are lost.
    const originalGetGlobalSettings = manager.getGlobalSettings.bind(manager);
    manager.getGlobalSettings = function getGlobalSettingsWithNexusConversion() {
      const gs = originalGetGlobalSettings();
      if (convertedPackages !== undefined) {
        (gs as Record<string, unknown>).packages = convertedPackages;
        (gs as Record<string, unknown>).extensions = clearedExtensions;
      }
      return gs;
    };
    return manager;
  };

  patchedSettingsManager.__nexusConfigPatched__ = true;
}
