import { join } from "node:path";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { slugifyMemoryName } from "../path/slugifyMemoryName.js";

/**
 * Resolves the Projects-compatible reference directory for a tweet.
 *
 * @param root Memory root directory.
 * @param input Tweet reference input.
 * @returns Reference directory path.
 */
export function resolveReferenceDirectory(root: string, input: TweetReferenceInput): string {
	const projectRoot = join(root, slugifyMemoryName(input.projectName));
	const base = input.kind === "app"
		? join(projectRoot, "apps", slugifyMemoryName(input.appName ?? "inbox"))
		: join(projectRoot, "packages", slugifyMemoryName(input.packageGroup ?? "general"), slugifyMemoryName(input.packageName ?? "inbox"));
	return input.featureName ? join(base, "features", slugifyMemoryName(input.featureName), "reference") : join(base, "reference");
}
