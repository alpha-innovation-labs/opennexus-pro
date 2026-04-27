import { AuthStorage } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/auth-storage.js";
import { SettingsManager } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { filterLoggedInEnabledModelPatterns } from "./filterLoggedInEnabledModelPatterns.js";

type WritableSettingsManager = {
  getEnabledModels: () => string[] | undefined;
  setEnabledModels: (patterns: string[] | undefined) => void;
  writeQueue?: Promise<void>;
};

/**
 * Removes provider-qualified scoped models whose providers no longer have auth.
 *
 * @param cwd Current working directory for project-aware settings loading.
 */
export async function pruneLoggedOutEnabledModels(cwd: string): Promise<void> {
  const authStorage = AuthStorage.create();
  const settings = SettingsManager.create(cwd) as unknown as WritableSettingsManager;
  const enabledModels = settings.getEnabledModels();
  const nextEnabledModels = filterLoggedInEnabledModelPatterns(enabledModels, authStorage);
  if (enabledModels === nextEnabledModels || areEqualModels(enabledModels, nextEnabledModels)) return;
  settings.setEnabledModels(nextEnabledModels);
  await settings.writeQueue;
}

/**
 * Compares two enabled-model arrays by ordered value.
 *
 * @param left First model list.
 * @param right Second model list.
 * @returns True when both lists have identical entries.
 */
function areEqualModels(left: string[] | undefined, right: string[] | undefined): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
