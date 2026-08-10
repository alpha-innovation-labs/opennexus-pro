import type { ResourceCommandScope } from "./ResourceCommandScope";

/**
 * Resolves a numeric hotkey to a resource command scope.
 *
 * @param key Pressed key.
 * @returns Matching scope, if the key is a scope selector.
 */
export function selectResourceCommandScopeByKey(key: string): ResourceCommandScope | undefined {
  if (key === "1") return "all";
  if (key === "2") return "global";
  if (key === "3") return "local";
  return undefined;
}
