import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Resolve the child-side extension entry (`child`) to an absolute path the parent
 * hands to the child's `--extension` flag.
 *
 * The parent is loaded from `src/` in dev (jiti/tsx) and from `dist/` when built
 * (tsdown emits the child entry separately), so the sibling entry is `child.ts` in
 * source and `child.mjs` in the built output. The child process loads that path with
 * its own jiti, so either extension works. The first candidate that exists wins; the
 * parent entry's own extension picks the fallback when none do.
 */
export function childExtensionPath(): string {
	const here = new URL(".", import.meta.url);
	for (const candidate of ["child.ts", "child.mjs", "child.js"]) {
		const url = new URL(candidate, here);
		if (existsSync(fileURLToPath(url))) {
			return fileURLToPath(url);
		}
	}
	// Last resort: the parent entry's own extension signals the build state.
	const sibling = fileURLToPath(import.meta.url).endsWith(".mjs")
		? "child.mjs"
		: "child.ts";
	return fileURLToPath(new URL(sibling, here));
}
