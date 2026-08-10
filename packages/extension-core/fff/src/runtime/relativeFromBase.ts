import { relative } from "node:path";
import { normalizeSlashes } from "./normalizeSlashes";

/**
 * Builds a normalized relative path from the runtime base.
 *
 * @param basePath Runtime base path.
 * @param targetPath Target absolute path.
 * @returns Relative path.
 */
export function relativeFromBase(basePath: string, targetPath: string): string {
  const relativePath = normalizeSlashes(relative(basePath, targetPath));
  return relativePath || ".";
}
