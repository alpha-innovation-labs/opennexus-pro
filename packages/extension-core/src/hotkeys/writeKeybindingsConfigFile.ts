import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Writes keybindings config JSON to disk, creating the containing config folder.
 *
 * @param configPath Absolute keybindings.json path.
 * @param config Keybindings config object.
 */
export function writeKeybindingsConfigFile(configPath: string, config: Record<string, string | string[] | undefined>): void {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");
}
