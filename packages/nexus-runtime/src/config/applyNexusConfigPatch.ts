import { join } from "node:path";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath.js";
import { readBundledDefaultSettings } from "@nexus/assets/default-settings/readBundledDefaultSettings.js";
import { getDefaultThemeName } from "./getDefaultThemeName.js";
import { getProjectConfigPath } from "./getProjectConfigPath.js";
import { getProjectThemesPath } from "./getProjectThemesPath.js";
import { getUserConfigPath } from "./getUserConfigPath.js";
import { getUserThemesPath } from "./getUserThemesPath.js";
import { mergeSettings, type SettingsRecord } from "./mergeSettings.js";

type SettingsManagerModule = typeof import("@earendil-works/pi-coding-agent");
type ResourceLoaderModule = typeof import("@earendil-works/pi-coding-agent");
type LoadThemesResult = {
  themes: unknown[];
  diagnostics: unknown[];
};

type LoadThemesMethod = (paths: string[], includeDefaults?: boolean) => LoadThemesResult;

type ThemeDirectoryLoader = (path: string, themes: unknown[], diagnostics: unknown[]) => void;

type NexusSettingsManagerInstance = {
  globalSettings: SettingsRecord;
  projectSettings: SettingsRecord;
  settings: SettingsRecord;
};

type NexusSettingsManagerClass = {
  __nexusConfigPatched__?: boolean;
  fromStorage(storage: unknown): NexusSettingsManagerInstance;
  create(cwd?: string, agentDir?: string): NexusSettingsManagerInstance;
  prototype: { getTheme(): string | undefined };
};

type NexusResourceLoaderPrototype = {
  agentDir: string;
  cwd: string;
  loadThemesFromDir: ThemeDirectoryLoader;
};

/**
 * Patches Pi runtime config lookups so Nexus uses shipped app defaults,
 * `.nexus` project config, and a Nexus theme fallback.
 *
 * @returns Promise that resolves after the patch is installed.
 */
export async function applyNexusConfigPatch(): Promise<void> {
  const [{ SettingsManager }, { DefaultResourceLoader }] = await Promise.all([
    import("@earendil-works/pi-coding-agent"),
    import("@earendil-works/pi-coding-agent"),
  ]);

  const patchedSettingsManager = SettingsManager as unknown as NexusSettingsManagerClass;
  if (patchedSettingsManager.__nexusConfigPatched__) {
    return;
  }

  const appDefaults = readBundledDefaultSettings();
  const originalFromStorage = patchedSettingsManager.fromStorage;
  const originalGetTheme = SettingsManager.prototype.getTheme;

  patchedSettingsManager.fromStorage = function fromStorageWithNexusDefaults(storage: unknown) {
    const manager = originalFromStorage.call(this, storage) as unknown as NexusSettingsManagerInstance;
    manager.globalSettings = mergeSettings(appDefaults, manager.globalSettings);
    manager.settings = mergeSettings(manager.globalSettings, manager.projectSettings);
    // Convert Nexus-style extensions.pi_packages to Pi-expected packages array format.
    // Pi's resolver reads `globalSettings.packages` as an array of package source strings.
    // Nexus stores it as { pi_packages: { name: bool } }. Convert on-the-fly.
    // Also clear `globalSettings.extensions` when it's in Nexus object format,
    // because Pi's resolver expects `extensions` to be an array of file paths.
    const nexusExt = (manager.globalSettings as Record<string, unknown>).extensions;
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

  patchedSettingsManager.prototype.getTheme = function getThemeWithNexusFallback(): string {
    return originalGetTheme.call(this) ?? getDefaultThemeName();
  };

  patchedSettingsManager.create = function createNexusSettingsManager(cwd = process.cwd(), agentDir = getNexusAgentDirPath()) {
    // FileSettingsStorage is not exported from the package — use a minimal stub
    // that provides the same globalSettingsPath / projectSettingsPath / withLock interface.
    const storage = {
      globalSettingsPath: getUserConfigPath(),
      projectSettingsPath: getProjectConfigPath(cwd),
      withLock(_scope: string, fn: (current: string | undefined) => string | undefined) {
        // No-op: Nexus manages settings through readNexusUserConfig / writeNexusUserConfig.
        // Pi's SettingsManager calls withLock internally; return undefined to skip writes.
        return fn(undefined);
      },
    } as unknown as { globalSettingsPath: string; projectSettingsPath: string; withLock: (scope: string, fn: (current: string | undefined) => string | undefined) => string | undefined };
    return patchedSettingsManager.fromStorage(storage);
  };

  const resourceLoaderPrototype = DefaultResourceLoader.prototype as unknown as NexusResourceLoaderPrototype & { loadThemes: LoadThemesMethod };
  const originalLoadThemes = resourceLoaderPrototype.loadThemes;
  resourceLoaderPrototype.loadThemes = function loadThemesFromNexusConfig(
    this: NexusResourceLoaderPrototype,
    paths: string[],
    includeDefaults = true,
  ): LoadThemesResult {
    const result = originalLoadThemes.call(this, paths, false);

    if (!includeDefaults) {
      return result;
    }

    const themes: unknown[] = [];
    const diagnostics: unknown[] = [];
    for (const dir of [getUserThemesPath(), getProjectThemesPath(this.cwd)]) {
      this.loadThemesFromDir(dir, themes, diagnostics);
    }

    return {
      themes: [...themes, ...result.themes],
      diagnostics: [...diagnostics, ...result.diagnostics],
    };
  };

  patchedSettingsManager.__nexusConfigPatched__ = true;
}
