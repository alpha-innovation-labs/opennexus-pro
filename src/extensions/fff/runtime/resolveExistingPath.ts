import { isAbsolute, resolve } from "node:path";
import { getPathType } from "./getPathType.js";
import { relativeFromBase } from "./relativeFromBase.js";

/**
 * Resolves a direct file-system path before fuzzy lookup.
 *
 * @param cwd Session cwd.
 * @param basePath Runtime base path.
 * @param query Normalized path query.
 * @param allowDirectory Whether directories are allowed.
 * @returns Resolved direct path, if found.
 */
export async function resolveExistingPath(
  cwd: string,
  basePath: string,
  query: string,
  allowDirectory: boolean,
): Promise<{ absolutePath: string; relativePath: string; pathType: "file" | "directory" } | null> {
  const candidates = isAbsolute(query)
    ? [query]
    : query.startsWith("./") || query.startsWith("../")
      ? [resolve(cwd, query)]
      : basePath === cwd
        ? [resolve(cwd, query)]
        : [resolve(basePath, query), resolve(cwd, query)];

  for (const directPath of candidates) {
    const pathType = await getPathType(directPath);
    if (!pathType) continue;
    if (pathType === "directory" && !allowDirectory) continue;
    return {
      absolutePath: directPath,
      relativePath: relativeFromBase(basePath, directPath),
      pathType,
    };
  }

  return null;
}
