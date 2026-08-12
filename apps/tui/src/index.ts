import { APP_NAME } from "@nexus/pi-platform";

// In dev mode (running via `just dev`), override the process title to
// "mastracode" so Herdr's detection logic matches the agent kind.
// The release wrapper uses `exec -a mastracode` on the compiled binary,
// which Herdr matches by canonical executable. In dev, we run via
// `npx tsx` which spawns child processes that lose the `exec -a` title.
// Setting process.title here ensures the innermost process (node) reports
// the correct name regardless of the process chain.
if (process.env.NEXUS_DEV_MODE === "1") {
  process.title = "mastracode";
} else {
  process.title = APP_NAME;
}

import { runCliWithApp } from "./cli/runCliWithApp";
import { runApp } from "./runtime/runApp";

/**
 * Boots the Nexus executable (dev or release).
 */
async function main() {
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
