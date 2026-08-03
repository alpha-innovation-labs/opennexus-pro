import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath.js";
import { applyNexusConfigPatch } from "@nexus/runtime/config/applyNexusConfigPatch.js";
import { removeUserExtensionConfig } from "@nexus/runtime/config/removeUserExtensionConfig.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";
import { createNexusCliPackageManager } from "../install/createNexusCliPackageManager.js";
import { normalizeUninstallSource } from "./normalizeUninstallSource.js";
import { parseUninstallCommand } from "./parseUninstallCommand.js";
import { printUninstallUsage } from "./printUninstallUsage.js";

/**
 * Runs the Nexus package uninstall command when argv targets it.
 *
 * @param argv Raw CLI arguments.
 * @returns Exit code when handled, otherwise undefined.
 */
export async function runUninstallCommand(argv: readonly string[]): Promise<number | undefined> {
  const options = parseUninstallCommand(argv);
  if (!options) return undefined;
  if (options.help) {
    printUninstallUsage();
    return 0;
  }
  if (options.invalidOption) {
    console.error(`Unknown option ${options.invalidOption} for "uninstall".`);
    console.error("Usage: nexus uninstall <source> [-l]");
    return 1;
  }
  if (options.invalidArgument) {
    console.error(`Unexpected argument ${options.invalidArgument}.`);
    console.error("Usage: nexus uninstall <source> [-l]");
    return 1;
  }
  if (!options.source) {
    console.error("Missing uninstall source.");
    console.error("Usage: nexus uninstall <source> [-l]");
    return 1;
  }

  getNexusAgentDirPath();
  await applyNexusConfigPatch();
  const source = normalizeUninstallSource(options.source);
  const runtime = createNexusCliPackageManager(process.cwd());
  runtime.packageManager.setProgressCallback((event) => {
    if (event.type === "start") process.stdout.write(`${event.message}\n`);
  });

  try {
    // Uninstall the npm package from disk without touching settings
    await runtime.packageManager.remove(source, { local: options.local });
    // Remove the Nexus extension config entry
    const removedExtensionConfig = removeUserExtensionConfig(source);
    // Clean up empty `packages` array if Pi's uninstall left one behind
    const config = readNexusUserConfig();
    if (Array.isArray(config.packages) && config.packages.length === 0) {
      writeNexusUserConfig({ ...config, packages: undefined });
    }
    if (!removedExtensionConfig) {
      console.error(`No configured package or extension matched ${options.source}.`);
      return 1;
    }
    console.log(`Uninstalled ${options.source}`);
    console.log("Restart Nexus to unload it.");
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown uninstall error";
    console.error(`Error: ${message}`);
    return 1;
  }
}
