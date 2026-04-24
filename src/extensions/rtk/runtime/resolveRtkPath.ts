import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";

/**
 * Resolves an RTK path against the current cwd.
 *
 * @param cwd Current working directory.
 * @param filePath User-supplied file path.
 * @returns Absolute or cwd-relative path.
 */
export function resolveRtkPath(cwd: string, filePath: string): string {
  if (filePath === "~") {
    return homedir();
  }

  if (filePath.startsWith("~/")) {
    return homedir() + filePath.slice(1);
  }

  if (isAbsolute(filePath)) {
    return filePath;
  }

  return resolve(cwd, filePath);
}
