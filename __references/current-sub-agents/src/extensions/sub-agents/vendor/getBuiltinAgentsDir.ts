import { resolveBundledAssetPath } from "../../../runtime/package/resolveBundledAssetPath.js";

/**
 * Resolves the builtin subagent definition directory.
 *
 * @returns Absolute builtin agents directory path.
 */
export function getBuiltinAgentsDir(): string {
  return resolveBundledAssetPath(import.meta.url, "subagents/agents", "./agents/");
}
