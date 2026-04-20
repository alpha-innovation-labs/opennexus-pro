import { join } from "node:path";
import { readBundledDefaultSettings } from "./default-settings/readBundledDefaultSettings.js";
import { getDefaultThemeName } from "./getDefaultThemeName.js";
import { getProjectSettingsPath } from "./getProjectSettingsPath.js";
import { getProjectThemesPath } from "./getProjectThemesPath.js";
import { mergeSettings, type SettingsRecord } from "./mergeSettings.js";

type SettingsManagerModule = typeof import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js");
type ResourceLoaderModule = typeof import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/resource-loader.js");

type LoadThemesResult = {
  themes: unknown[];
  diagnostics: unknown[];
};

type LoadThemesMethod = (paths: string[], includeDefaults?: boolean) => LoadThemesResult;

type ThemeDirectoryLoader = (path: string, themes: unknown[], diagnostics: unknown[]) => void;

type NexusSettingsManagerInstance = InstanceType<SettingsManagerModule["SettingsManager"]> & {
  globalSettings: SettingsRecord;
  projectSettings: SettingsRecord;
  settings: SettingsRecord;
};

type NexusSettingsManagerClass = SettingsManagerModule["SettingsManager"] & {
  __nexusConfigPatched__?: boolean;
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
  const [{ FileSettingsStorage, SettingsManager }, { DefaultResourceLoader }] = await Promise.all([
    import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js"),
    import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/resource-loader.js"),
  ]);

  const patchedSettingsManager = SettingsManager as NexusSettingsManagerClass;
  if (patchedSettingsManager.__nexusConfigPatched__) {
    return;
  }

  const appDefaults = readBundledDefaultSettings();
  const originalFromStorage = SettingsManager.fromStorage;
  const originalGetTheme = SettingsManager.prototype.getTheme;

  SettingsManager.fromStorage = function fromStorageWithNexusDefaults(storage) {
    const manager = originalFromStorage.call(this, storage) as NexusSettingsManagerInstance;
    manager.globalSettings = mergeSettings(appDefaults, manager.globalSettings);
    manager.settings = mergeSettings(manager.globalSettings, manager.projectSettings);
    return manager;
  };

  SettingsManager.prototype.getTheme = function getThemeWithNexusFallback(this: InstanceType<SettingsManagerModule["SettingsManager"]>): string {
    return originalGetTheme.call(this) ?? getDefaultThemeName();
  };

  SettingsManager.create = function createNexusSettingsManager(cwd = process.cwd(), agentDir?: string) {
    const storage = new FileSettingsStorage(cwd, agentDir);
    storage.projectSettingsPath = getProjectSettingsPath(cwd);
    return SettingsManager.fromStorage(storage);
  };

  const originalLoadThemes = DefaultResourceLoader.prototype.loadThemes as LoadThemesMethod;
  DefaultResourceLoader.prototype.loadThemes = function loadThemesFromNexusConfig(
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
    for (const dir of [join(this.agentDir, "themes"), getProjectThemesPath(this.cwd)]) {
      this.loadThemesFromDir(dir, themes, diagnostics);
    }

    return {
      themes: [...themes, ...result.themes],
      diagnostics: [...diagnostics, ...result.diagnostics],
    };
  };

  patchedSettingsManager.__nexusConfigPatched__ = true;
}
