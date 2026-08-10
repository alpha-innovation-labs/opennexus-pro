import { existsSync } from "node:fs";
import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath";

/**
 * Resolves the user commands directory path.
 *
 * @returns Absolute path to `~/.config/nexus/commands`.
 */
export function getUserCommandsPath(): string {
  return join(getUserConfigDirPath(), "commands");
}

/**
 * Checks whether the user commands directory exists on disk.
 *
 * @returns `true` if `~/.config/nexus/commands` exists.
 */
export function userCommandsExists(): boolean {
  return existsSync(getUserCommandsPath());
}
