import { createHash } from "node:crypto";

/**
 * Builds a stable filesystem-safe key from one project cwd.
 *
 * @param cwd Project working directory.
 * @returns Stable project key.
 */
export function createTodoProjectKey(cwd: string): string {
	const normalized = cwd.trim() || "unknown-cwd";
	const label = normalized
		.replace(/^[A-Za-z]:/, "")
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(-48) || "project";
	const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
	return `${label}-${hash}`;
}
