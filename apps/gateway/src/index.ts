import { runGatewayDaemon } from "@nexus/gateway-core/runner/runGatewayDaemon.js";

/**
 * Starts the standalone Nexus adapter gateway daemon app.
 *
 * @returns A promise that resolves when the daemon exits.
 */
async function main(): Promise<void> {
  await runGatewayDaemon();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
