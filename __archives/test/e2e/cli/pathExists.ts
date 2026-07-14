import { access } from "node:fs/promises";

/**
 * Returns whether a filesystem path exists.
 *
 * @param path Filesystem path to inspect.
 * @returns True when the path exists.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
