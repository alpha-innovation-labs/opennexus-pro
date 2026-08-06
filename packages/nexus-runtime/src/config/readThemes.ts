import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath.js";

let cachedNames: string[] | null = null;
let cacheCwd: string | null = null;
let cacheAgentDir: string | null = null;

/**
 * Reads available theme names using Pi's DefaultResourceLoader,
 * which discovers themes from bundled, agent-dir, user, and project
 * directories. Results are cached per cwd + agentDir combination
 * to avoid reloading extensions on every slash-menu keystroke.
 *
 * @param cwd Project working directory.
 * @returns Sorted list of available theme names (deduplicated across directories).
 */
export async function readThemes(cwd: string): Promise<string[]> {
  const agentDir = getNexusAgentDirPath();
  if (cachedNames !== null && cacheCwd === cwd && cacheAgentDir === agentDir) {
    return cachedNames;
  }
  const loader = new DefaultResourceLoader({
    cwd,
    agentDir,
    noThemes: false,
  });
  await loader.reload();
  const { themes } = loader.getThemes();
  const names = themes.map((t) => t.name).filter((n): n is string => typeof n === "string");
  cachedNames = [...new Set(names)].sort((left, right) => left.localeCompare(right));
  cacheCwd = cwd;
  cacheAgentDir = agentDir;
  return cachedNames;
}
