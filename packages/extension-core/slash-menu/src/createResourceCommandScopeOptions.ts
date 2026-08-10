import type { ResourceCommandScope } from "./ResourceCommandScope";

/**
 * Creates resource command scope options in header display order.
 *
 * @returns Scope options.
 */
export function createResourceCommandScopeOptions(): ResourceCommandScope[] {
  return ["all", "global", "local"];
}
