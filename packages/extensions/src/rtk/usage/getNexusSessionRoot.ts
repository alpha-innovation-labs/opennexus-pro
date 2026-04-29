import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the default Nexus session storage root.
 *
 * @returns Absolute path to Nexus JSONL sessions.
 */
export function getNexusSessionRoot(): string {
  return process.env.NEXUS_SESSION_ROOT ?? join(homedir(), ".local", "share", "nexus", "agent", "sessions");
}
