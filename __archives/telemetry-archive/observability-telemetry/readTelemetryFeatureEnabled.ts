import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads the source feature flag that controls telemetry emission.
 *
 * @param cwd Directory used to locate feature-flags.json.
 * @returns False only when the telemetry feature is explicitly disabled.
 */
export function readTelemetryFeatureEnabled(cwd = process.cwd()): boolean {
  try {
    const configPath = join(cwd, "feature-flags.json");
    const config = JSON.parse(readFileSync(configPath, "utf8")) as { other?: { telemetry?: { enabled?: unknown } } };
    return config.other?.telemetry?.enabled !== false;
  } catch {
    return true;
  }
}
