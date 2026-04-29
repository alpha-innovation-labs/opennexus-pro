import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the local anonymous PostHog distinct id file path.
 *
 * @returns Local id file path.
 */
export function getPostHogDistinctIdPath(): string {
  return join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "nexus", "telemetry", "posthog-distinct-id");
}
