import { readFile } from "node:fs/promises";

/**
 * Reads a JSON file, returning undefined when it is missing or invalid.
 *
 * @param filePath JSON file path.
 * @returns Parsed JSON value when available.
 */
export async function readJsonFile(filePath: string | undefined): Promise<unknown> {
  if (!filePath) return undefined;
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return undefined;
  }
}
