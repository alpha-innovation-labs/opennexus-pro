#!/usr/bin/env node
import { runCliWithApp } from "./cli/runCliWithApp.js";
import { runApp } from "./runtime/runApp.js";

/**
 * Boots the installed Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp });
}

main().catch(async (error) => {
  // Telemetry archived — log crash without sending.
  console.error(error);
  process.exit(1);
});
