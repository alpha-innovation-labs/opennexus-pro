import { readFileSync } from "node:fs";

/**
 * Reads the source markdown for a prompt or skill command.
 *
 * @param sourcePath Source file path.
 * @returns Markdown source content, if readable.
 */
export function readResourceCommandMarkdown(sourcePath: string | undefined): string | undefined {
  if (!sourcePath) return undefined;
  try {
    return readFileSync(sourcePath, "utf8");
  } catch {
    return undefined;
  }
}
