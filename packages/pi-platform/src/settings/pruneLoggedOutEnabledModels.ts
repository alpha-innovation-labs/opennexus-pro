import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { filterLoggedInEnabledModelPatterns } from "./filterLoggedInEnabledModelPatterns.js";
import { homedir } from "node:os";
import { join } from "node:path";

type WritableSettingsManager = {
  getEnabledModels: () => string[] | undefined;
  setEnabledModels: (patterns: string[] | undefined) => void;
  writeQueue?: Promise<void>;
};

// AuthStorage is not exported from the package — stub with a no-op auth reader.
// The package's AuthStorage.create() uses getAgentDir() internally, which we
// resolve via the same logic as getNexusAgentDirPath().
function getNexusAgentDir(): string {
  return join(homedir(), ".local", "share", "nexus", "agent");
}

function createStubAuthStorage(): { hasAuth: (provider: string) => boolean } {
  return { hasAuth: () => true };
}

/**
 * Removes provider-qualified scoped models whose providers no longer have auth.
 *
 * @param cwd Current working directory for project-aware settings loading.
 */
export async function pruneLoggedOutEnabledModels(cwd: string): Promise<void> {
  const authStorage = createStubAuthStorage();
  const settings = SettingsManager.create(cwd, getNexusAgentDir()) as unknown as WritableSettingsManager;
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
