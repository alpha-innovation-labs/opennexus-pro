import { startE2eServer } from "./server/startE2eServer.js";

/**
 * Starts the local browser-hosted Nexus wterm e2e.
 */
async function main(): Promise<void> {
  await startE2eServer();
}

void main();
