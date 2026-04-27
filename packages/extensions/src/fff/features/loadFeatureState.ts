import { readFile } from "node:fs/promises";
import { filterValidFeatureKeys } from "./filterValidFeatureKeys.js";
import { getAllFeatureKeys } from "./getAllFeatureKeys.js";
import { getFeatureStatePath } from "./getFeatureStatePath.js";
import type { FffFeatureKey } from "../shared/types.js";

/**
 * Loads persisted FFF feature flags.
 *
 * @returns Enabled feature keys.
 */
export async function loadFeatureState(): Promise<Set<FffFeatureKey>> {
  try {
    const parsed = JSON.parse(await readFile(getFeatureStatePath(), "utf8")) as { enabledFeatures?: unknown[] };
    const enabled = Array.isArray(parsed.enabledFeatures)
      ? filterValidFeatureKeys(parsed.enabledFeatures)
      : getAllFeatureKeys();
    return new Set(enabled);
  } catch {
    return new Set(getAllFeatureKeys());
  }
}
