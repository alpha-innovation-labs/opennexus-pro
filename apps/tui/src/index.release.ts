import { runCliWithApp } from "./cli/runCliWithApp.js";
import { runApp } from "./runtime/runApp.js";
import { APP_NAME } from "@nexus/pi-platform/config.js";

process.title = APP_NAME;

/**
 * Boots the compiled Nexus executable.
 */
async function main() {
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
