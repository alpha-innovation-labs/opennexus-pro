#!/usr/bin/env node
import { runCli } from "./cli/runCli.js";

/**
 * Boots the installed Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  process.exitCode = await runCli(process.argv.slice(2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
