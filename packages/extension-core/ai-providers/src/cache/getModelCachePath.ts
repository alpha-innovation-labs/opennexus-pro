/**
 * Resolves the path to the async model cache JSON file.
 *
 * The cache lives inside the active Nexus agent directory under `cache/`.
 * This path is resolved identically to every other Nexus path helper:
 * 1. Checks `NEXUS_CODING_AGENT_DIR` env var.
 * 2. Falls back to `PI_CODING_AGENT_DIR` env var.
 * 3. Default: `~/.local/share/nexus/agent/cache/available_models.json`.
 *
 * @returns Absolute path to the cache file.
 */

import { join } from "node:path";
import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath";

export function getModelCachePath(): string {
	return join(getNexusAgentDirPath(), "cache", "available_models.json");
}
