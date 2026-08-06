import { cp, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { getBundledThemesPath } from "@nexus/assets/themes/getBundledThemesPath.js";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath.js";

const THEMES_DIR_NAME = "themes";

/**
 * Copies bundled theme JSON files into the Nexus agent directory so Pi
 * discovers them natively via `agentDir/.themes/`.
 *
 * Skips files that already exist and have matching content (avoids
 * unnecessary writes on every startup).
 *
 * @returns Promise that resolves after the copy completes.
 */
export async function copyBundledThemes(): Promise<void> {
  const bundledPath = getBundledThemesPath();
  const agentDir = getNexusAgentDirPath();
  const targetDir = join(agentDir, THEMES_DIR_NAME);

  let entries: string[];
  try {
    entries = await readdir(bundledPath);
  } catch {
    // Bundled themes directory doesn't exist yet (e.g. dev environment
    // before release assets are staged). No-op.
    return;
  }

  const jsonFiles = entries.filter((name) => name.endsWith(".json"));
  if (jsonFiles.length === 0) {
    return;
  }

  await mkdir(targetDir, { recursive: true });

  for (const fileName of jsonFiles) {
    const source = join(bundledPath, fileName);
    const target = join(targetDir, fileName);
    await cp(source, target, { recursive: true, force: false });
  }
}
