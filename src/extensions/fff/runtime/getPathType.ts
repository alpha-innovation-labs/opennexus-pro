import { stat } from "node:fs/promises";

/**
 * Reads the file-system type for a path.
 *
 * @param path Absolute path to inspect.
 * @returns File, directory, or null when missing.
 */
export async function getPathType(path: string): Promise<"file" | "directory" | null> {
  try {
    const info = await stat(path);
    if (info.isFile()) return "file";
    if (info.isDirectory()) return "directory";
    return null;
  } catch {
    return null;
  }
}
