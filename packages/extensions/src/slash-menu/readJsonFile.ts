import { readFile } from "node:fs/promises";

/**
 * Reads one JSON file and returns undefined on missing or invalid content.
 *
 * @param path File path.
 * @returns Parsed JSON value.
 */
export async function readJsonFile<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}
