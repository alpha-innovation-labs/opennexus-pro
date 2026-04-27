import { getAgentDir } from "@mariozechner/pi-coding-agent";
import { join } from "node:path";

/**
 * Returns the persisted feature-state path for the bundled FFF extension.
 *
 * @returns Absolute feature-state file path.
 */
export function getFeatureStatePath(): string {
  return join(getAgentDir(), "extensions", "fff.json");
}
