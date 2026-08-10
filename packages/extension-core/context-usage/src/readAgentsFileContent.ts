import { readTextFile } from "./readTextFile.js";

/**
 * Reads AGENTS.md content from disk when Pi's structured context content is stale or empty.
 *
 * @param path AGENTS.md file path.
 * @returns File content when readable, otherwise undefined.
 */
export function readAgentsFileContent(path: string): string | undefined {
  return readTextFile(path);
}
