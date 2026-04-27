import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getFeatureStatePath } from "./getFeatureStatePath.js";
import type { FffFeatureKey } from "../shared/types.js";

/**
 * Persists enabled FFF feature keys.
 *
 * @param enabledFeatures Enabled features to persist.
 */
export async function saveFeatureState(enabledFeatures: Set<FffFeatureKey>): Promise<void> {
  const path = getFeatureStatePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify({ enabledFeatures: [...enabledFeatures] }, null, 2)}\n`, "utf8");
}
