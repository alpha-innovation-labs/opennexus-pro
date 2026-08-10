import { readFile } from "node:fs/promises";
import { filterValidFeatureKeys } from "./filterValidFeatureKeys";
import { getAllFeatureKeys } from "./getAllFeatureKeys";
import { getFeatureStatePath } from "./getFeatureStatePath";
import type { FffFeatureKey } from "../shared/types";

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
