import { join } from "node:path";
import { getAgentDir } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/config.js";
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
  const [{ FileSettingsStorage, SettingsManager }, { DefaultResourceLoader }] = await Promise.all([
    import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js"),
    import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/resource-loader.js"),
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
    return manager;
  };

  patchedSettingsManager.prototype.getTheme = function getThemeWithNexusFallback(): string {
    return originalGetTheme.call(this) ?? getDefaultThemeName();
  };

  patchedSettingsManager.create = function createNexusSettingsManager(cwd = process.cwd(), agentDir = getAgentDir()) {
    const storage = new FileSettingsStorage(cwd, agentDir) as unknown as { projectSettingsPath: string };
    storage.projectSettingsPath = getProjectSettingsPath(cwd);
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
