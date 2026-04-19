import { fileURLToPath } from "node:url";

/**
 * Resolves the bundled themes directory path.
 *
 * @returns Absolute bundled themes directory path.
 */
export function getBundledThemesPath(): string {
  return fileURLToPath(new URL("./", import.meta.url));
}
