import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves Pi coding-agent's installed dist directory through Node's package resolver.
 *
 * @returns Absolute path to the installed Pi dist directory.
 */
export function getPiCodingAgentDistRoot(): string {
  return dirname(fileURLToPath(import.meta.resolve("@earendil-works/pi-coding-agent")));
}
