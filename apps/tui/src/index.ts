// In dev mode (running via `just dev`), override the process title to
// "mastracode" so Herdr's detection logic matches the agent kind.
// The release wrapper uses `exec -a mastracode` on the compiled binary,
// which Herdr matches by canonical executable. In dev, we run via
// `npx tsx` which spawns child processes that lose the `exec -a` title.
// Setting process.title here ensures the innermost process (node) reports
// the correct name regardless of the process chain.
if (process.env.NEXUS_DEV_MODE !== "1") {
  // Dynamic import: only load APP_NAME from @nexus/pi-platform when
  // running in release mode (not dev). In dev mode we hardcode "mastracode".
  const { APP_NAME } = await import("@nexus/pi-platform");
  process.title = APP_NAME;
} else {
  process.title = "mastracode";
}

import { runLightweightCli } from "./cli/runLightweightCli";

/**
 * Boots the Nexus executable (dev or release).
 */
async function main() {
  // Handle lightweight CLI commands (factory, --help, --version) without
  // importing the heavy runtime. These commands never need runApp.
  const handled = await runLightweightCli(process.argv.slice(2));
  if (handled) return;

  // Dynamic import: only load the heavy runtime when the CLI falls through
  // to interactive app mode.
  const { runCliWithApp } = await import("./cli/runCliWithApp");
  const { runApp } = await import("./runtime/runApp");
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
