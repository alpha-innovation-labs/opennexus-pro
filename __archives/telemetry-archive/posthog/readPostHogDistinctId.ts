import { readFile } from "node:fs/promises";

/**
 * Reads an existing anonymous PostHog distinct id.
 *
 * @param filePath Distinct id file path.
 * @returns Existing distinct id when present.
 */
export async function readPostHogDistinctId(filePath: string): Promise<string | undefined> {
  try {
    const value = (await readFile(filePath, "utf8")).trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}
