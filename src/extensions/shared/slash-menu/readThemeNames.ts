import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { getBundledThemesPath } from "../../../themes/getBundledThemesPath.js";
import { getProjectThemesPath } from "../../../runtime/config/getProjectThemesPath.js";

/**
 * Reads available theme names from bundled and project theme directories.
 *
 * @param cwd Project cwd.
 * @returns Theme names.
 */
export async function readThemeNames(cwd: string): Promise<string[]> {
  const names = new Set<string>();
  for (const dir of [getBundledThemesPath(), getProjectThemesPath(cwd)]) {
    try {
      for (const entry of await readdir(dir)) {
        if (!entry.endsWith(".json")) continue;
        names.add(basename(join(dir, entry), ".json"));
      }
    } catch {}
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}
