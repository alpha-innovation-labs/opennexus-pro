import { runApp } from "./runtime/runApp.js";

/**
 * Boots the installed Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  await runApp(process.argv.slice(2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
