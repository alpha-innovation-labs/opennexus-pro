import type { ResolvedPath } from "../shared/types";
import { normalizeSlashes } from "./normalizeSlashes";

/**
 * Builds an FFF native scope constraint from a resolved path.
 *
 * @param scope Resolved scope path.
 * @returns Native constraint string.
 */
export function nativeConstraintForScope(
	scope: ResolvedPath | undefined,
): string | undefined {
	if (!scope) return undefined;
	const relativePath = normalizeSlashes(scope.relativePath)
		.replace(/^\.\//, "")
		.replace(/\/+$/, "");
	if (!relativePath || relativePath === ".") return undefined;
	return scope.pathType === "directory" ? `/${relativePath}/` : relativePath;
}
