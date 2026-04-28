import { runAnnotationsDaemon } from "@nexus/annotations-daemon-core/runner/runAnnotationsDaemon.js";

/**
 * Starts the standalone Nexus annotations daemon app.
 */
async function main(): Promise<void> {
  await runAnnotationsDaemon();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
