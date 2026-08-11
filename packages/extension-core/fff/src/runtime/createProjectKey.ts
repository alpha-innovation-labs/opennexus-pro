import { createHash } from "node:crypto";
import { resolve } from "node:path";

/**
 * Creates a stable short key for project-scoped runtime files.
 *
 * @param cwd Project cwd.
 * @returns Stable project key.
 */
export function createProjectKey(cwd: string): string {
	return createHash("sha1").update(resolve(cwd)).digest("hex").slice(0, 12);
}
