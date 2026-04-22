#!/usr/bin/env node
import { runCliWithApp } from "./cli/runCliWithApp.js";
import { runBundledApp } from "./runtime/runBundledApp.js";

/**
 * Boots the compiled Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp: runBundledApp });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
