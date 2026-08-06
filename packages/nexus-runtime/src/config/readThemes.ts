import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath.js";

/**
 * Reads available theme names using Pi's DefaultResourceLoader,
 * which discovers themes from bundled, agent-dir, user, and project
 * directories.
 *
 * @param cwd Project working directory.
 * @returns Sorted list of available theme names (deduplicated across directories).
 */
export async function readThemes(cwd: string): Promise<string[]> {
  const loader = new DefaultResourceLoader({
    cwd,
    agentDir: getNexusAgentDirPath(),
    noThemes: false,
  });
  await loader.reload();
  const { themes } = loader.getThemes();
  const names = themes.map((t) => t.name).filter((n): n is string => typeof n === "string");
  return [...new Set(names)].sort((left, right) => left.localeCompare(right));
}
