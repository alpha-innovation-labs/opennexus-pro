import { stat } from "node:fs/promises";

/**
 * Checks whether a path exists.
 *
 * @param path File-system path.
 * @returns True when the path exists.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
